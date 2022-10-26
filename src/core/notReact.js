let rootElement;
let virtualRootComponent;
// hooks
let hooks = [];
let hooksIdx = 0;
let hooksUnEffect = [];
let fluxEffectIdxArray = [];

function componentMount() {
  
  for (const idx of fluxEffectIdxArray) {
    hooksUnEffect[idx] = hooks[idx][1]();
  }
  fluxEffectIdxArray = [];
}

function notReact() {

  const render = (initialRootComponent = virtualRootComponent) => {
    // componentUnmount();
    
    if (!virtualRootComponent) virtualRootComponent = initialRootComponent
    
    diffUpdate(rootElement, createElement(virtualRootComponent), rootElement.children[0]);
    
    hooksIdx = 0;
    
    componentMount();
  }
  const debounceRender = debounce(render);

  const createRoot = (initialRootElement = rootElement) => {
    rootElement = initialRootElement;
    rootElement.innerHTML = '';
    return { render };
  }

  function useState(initialState) {
    if (!hooks[hooksIdx]) hooks.push(initialState);
    const idx = hooksIdx;

    function setState(newState) {
      if (typeof newState === 'function') {
        hooks[idx] = newState(hooks[idx]);
        // hooks[idx] = newState(state);
      } else {
        hooks[idx] = newState;
      }
      debounceRender();
    }
    hooksIdx++;
    return [ hooks[idx], setState ];
  }

  function useEffect(cb, dependencyArray) {
    
    let hasChange = true;
    if (hooks[hooksIdx]) {
      hasChange = dependencyArray.some((dep, i) => !Object.is(dep, hooks[hooksIdx][0][i]));
    }
    hooks[hooksIdx] = [dependencyArray, cb];
    if (hasChange) {
      
      if (hooksUnEffect[hooksIdx]) hooksUnEffect[hooksIdx]();
      fluxEffectIdxArray.push(hooksIdx);
    }
    hooksIdx++;
  }

  function useRef(defaultValue = null) {
    console.log(hooks[hooksIdx]);
    if (!hooks[hooksIdx]) {
      hooks.push({ current: defaultValue });
    }
    hooksIdx++;
    return hooks[hooksIdx - 1];
  }

  return { createRoot, useState, useEffect, useRef };
}



export default notReact();
export const { createRoot, useState, useEffect, useRef } = notReact();



function createElement(node) {
  
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node);
  }
  const { type, props, children } = node;
  let $el;
  if (typeof type === 'function') {
    return createElement(type({ props, children }));
  } else {
    $el = document.createElement(node.type);
  }
  Object.entries(props || {}).filter(([, value]) => value).forEach(([attr, value]) => {
    const checker = /^on/.test(attr);
    if (checker) {
      $el.addEventListener(attr.slice(2).toLowerCase(), value);
    }
    else if (attr === 'ref') {
      // $el의 참초를 위해 ref의 current값에 $el을 넣어준다.
      if (!value.current) value.current = $el;
    }
    else if (attr === 'className') {
      $el.className = value;
    } else if (attr === 'style') {
      console.log(attr, value);
      for (const [k, v] of Object.entries(value)) {
        console.log(k, v);
        $el.style[k] = v;
      }
      console.dir($el);
    } else {
      $el.setAttribute(attr, value);
    }
  })
  children.map(createElement).forEach(child => $el.appendChild(child));
  
  // 변환된 dom을 반환한다.
  return $el;
}

function diffUpdate(parent, newNode, oldNode) {
  console.log('diff', newNode);
  if (!newNode && oldNode) return oldNode.remove();
  if (newNode && !oldNode) return parent.appendChild(newNode);
  if (newNode instanceof Text && oldNode instanceof Text) {
    if (oldNode.nodeValue === newNode.nodeValue) return;
    oldNode.nodeValue = newNode.nodeValue
    return;
  }
  if (newNode.nodeName !== oldNode.nodeName) {
    const index = [ ...parent.childNodes ].indexOf(oldNode);
    oldNode.remove();
    parent.appendChild(newNode, index);
    return;
  }
  updateAttributes(oldNode, newNode);

  const newChildren = [ ...newNode.childNodes ];
  const oldChildren = [ ...oldNode.childNodes ];
  const maxLength = Math.max(newChildren.length, oldChildren.length);
  for (let i = 0; i < maxLength; i++) {
    diffUpdate(oldNode, newChildren[i], oldChildren[i]);
  }
}

function updateAttributes(oldNode, newNode) {
  // console.log(oldNode, newNode);
  for (const { name, value } of [...newNode.attributes]) {
    console.log(name, value);
    if (value === JSON.stringify(oldNode.getAttribute(name))) continue;
    if (name === 'style') {
      // console.log(name, value);
      // for (const [k, v] of Object.entries(value)) {
      //   oldNode.style[k] = v;
      // }
      oldNode.style = value;
      console.log(oldNode)
    } else {
      oldNode.setAttribute(name, value);
    }
  }
  for (const {name} of [ ...oldNode.attributes ]) {
    if (newNode.getAttribute(name) !== undefined) continue;
    oldNode.removeAttribute(name);
  }
}

function debounce(callback) {
  let nextFrameCallback = -1;
  return () => {
    cancelAnimationFrame(nextFrameCallback);
    nextFrameCallback = requestAnimationFrame(callback);
  }
}