export default function h(type, props, ...children) {
  return { type, props, children: children.flat() };
}