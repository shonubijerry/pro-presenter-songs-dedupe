// node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t;
var i;
var r;
var o;
var e;
var f;
var c;
var a;
var s;
var h;
var p;
var v;
var y;
var d = {};
var w = [];
var _ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var g = Array.isArray;
function m(n3, l3) {
  for (var u3 in l3) n3[u3] = l3[u3];
  return n3;
}
function b(n3) {
  n3 && n3.parentNode && n3.parentNode.removeChild(n3);
}
function k(l3, u3, t4) {
  var i3, r3, o3, e3 = {};
  for (o3 in u3) "key" == o3 ? i3 = u3[o3] : "ref" == o3 ? r3 = u3[o3] : e3[o3] = u3[o3];
  if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t4), "function" == typeof l3 && null != l3.defaultProps) for (o3 in l3.defaultProps) void 0 === e3[o3] && (e3[o3] = l3.defaultProps[o3]);
  return x(l3, e3, i3, r3, null);
}
function x(n3, t4, i3, r3, o3) {
  var e3 = { type: n3, props: t4, key: i3, ref: r3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o3 ? ++u : o3, __i: -1, __u: 0 };
  return null == o3 && null != l.vnode && l.vnode(e3), e3;
}
function S(n3) {
  return n3.children;
}
function C(n3, l3) {
  this.props = n3, this.context = l3;
}
function $(n3, l3) {
  if (null == l3) return n3.__ ? $(n3.__, n3.__i + 1) : null;
  for (var u3; l3 < n3.__k.length; l3++) if (null != (u3 = n3.__k[l3]) && null != u3.__e) return u3.__e;
  return "function" == typeof n3.type ? $(n3) : null;
}
function I(n3) {
  if (n3.__P && n3.__d) {
    var u3 = n3.__v, t4 = u3.__e, i3 = [], r3 = [], o3 = m({}, u3);
    o3.__v = u3.__v + 1, l.vnode && l.vnode(o3), q(n3.__P, o3, u3, n3.__n, n3.__P.namespaceURI, 32 & u3.__u ? [t4] : null, i3, null == t4 ? $(u3) : t4, !!(32 & u3.__u), r3), o3.__v = u3.__v, o3.__.__k[o3.__i] = o3, D(i3, o3, r3), u3.__e = u3.__ = null, o3.__e != t4 && P(o3);
  }
}
function P(n3) {
  if (null != (n3 = n3.__) && null != n3.__c) return n3.__e = n3.__c.base = null, n3.__k.some(function(l3) {
    if (null != l3 && null != l3.__e) return n3.__e = n3.__c.base = l3.__e;
  }), P(n3);
}
function A(n3) {
  (!n3.__d && (n3.__d = true) && i.push(n3) && !H.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(H);
}
function H() {
  try {
    for (var n3, l3 = 1; i.length; ) i.length > l3 && i.sort(e), n3 = i.shift(), l3 = i.length, I(n3);
  } finally {
    i.length = H.__r = 0;
  }
}
function L(n3, l3, u3, t4, i3, r3, o3, e3, f3, c3, a3) {
  var s3, h3, p3, v3, y3, _2, g2, m3 = t4 && t4.__k || w, b2 = l3.length;
  for (f3 = T(u3, l3, m3, f3, b2), s3 = 0; s3 < b2; s3++) null != (p3 = u3.__k[s3]) && (h3 = -1 != p3.__i && m3[p3.__i] || d, p3.__i = s3, _2 = q(n3, p3, h3, i3, r3, o3, e3, f3, c3, a3), v3 = p3.__e, p3.ref && h3.ref != p3.ref && (h3.ref && J(h3.ref, null, p3), a3.push(p3.ref, p3.__c || v3, p3)), null == y3 && null != v3 && (y3 = v3), (g2 = !!(4 & p3.__u)) || h3.__k === p3.__k ? (f3 = j(p3, f3, n3, g2), g2 && h3.__e && (h3.__e = null)) : "function" == typeof p3.type && void 0 !== _2 ? f3 = _2 : v3 && (f3 = v3.nextSibling), p3.__u &= -7);
  return u3.__e = y3, f3;
}
function T(n3, l3, u3, t4, i3) {
  var r3, o3, e3, f3, c3, a3 = u3.length, s3 = a3, h3 = 0;
  for (n3.__k = new Array(i3), r3 = 0; r3 < i3; r3++) null != (o3 = l3[r3]) && "boolean" != typeof o3 && "function" != typeof o3 ? ("string" == typeof o3 || "number" == typeof o3 || "bigint" == typeof o3 || o3.constructor == String ? o3 = n3.__k[r3] = x(null, o3, null, null, null) : g(o3) ? o3 = n3.__k[r3] = x(S, { children: o3 }, null, null, null) : void 0 === o3.constructor && o3.__b > 0 ? o3 = n3.__k[r3] = x(o3.type, o3.props, o3.key, o3.ref ? o3.ref : null, o3.__v) : n3.__k[r3] = o3, f3 = r3 + h3, o3.__ = n3, o3.__b = n3.__b + 1, e3 = null, -1 != (c3 = o3.__i = O(o3, u3, f3, s3)) && (s3--, (e3 = u3[c3]) && (e3.__u |= 2)), null == e3 || null == e3.__v ? (-1 == c3 && (i3 > a3 ? h3-- : i3 < a3 && h3++), "function" != typeof o3.type && (o3.__u |= 4)) : c3 != f3 && (c3 == f3 - 1 ? h3-- : c3 == f3 + 1 ? h3++ : (c3 > f3 ? h3-- : h3++, o3.__u |= 4))) : n3.__k[r3] = null;
  if (s3) for (r3 = 0; r3 < a3; r3++) null != (e3 = u3[r3]) && 0 == (2 & e3.__u) && (e3.__e == t4 && (t4 = $(e3)), K(e3, e3));
  return t4;
}
function j(n3, l3, u3, t4) {
  var i3, r3;
  if ("function" == typeof n3.type) {
    for (i3 = n3.__k, r3 = 0; i3 && r3 < i3.length; r3++) i3[r3] && (i3[r3].__ = n3, l3 = j(i3[r3], l3, u3, t4));
    return l3;
  }
  n3.__e != l3 && (t4 && (l3 && n3.type && !l3.parentNode && (l3 = $(n3)), u3.insertBefore(n3.__e, l3 || null)), l3 = n3.__e);
  do {
    l3 = l3 && l3.nextSibling;
  } while (null != l3 && 8 == l3.nodeType);
  return l3;
}
function O(n3, l3, u3, t4) {
  var i3, r3, o3, e3 = n3.key, f3 = n3.type, c3 = l3[u3], a3 = null != c3 && 0 == (2 & c3.__u);
  if (null === c3 && null == e3 || a3 && e3 == c3.key && f3 == c3.type) return u3;
  if (t4 > (a3 ? 1 : 0)) {
    for (i3 = u3 - 1, r3 = u3 + 1; i3 >= 0 || r3 < l3.length; ) if (null != (c3 = l3[o3 = i3 >= 0 ? i3-- : r3++]) && 0 == (2 & c3.__u) && e3 == c3.key && f3 == c3.type) return o3;
  }
  return -1;
}
function z(n3, l3, u3) {
  "-" == l3[0] ? n3.setProperty(l3, null == u3 ? "" : u3) : n3[l3] = null == u3 ? "" : "number" != typeof u3 || _.test(l3) ? u3 : u3 + "px";
}
function N(n3, l3, u3, t4, i3) {
  var r3, o3;
  n: if ("style" == l3) if ("string" == typeof u3) n3.style.cssText = u3;
  else {
    if ("string" == typeof t4 && (n3.style.cssText = t4 = ""), t4) for (l3 in t4) u3 && l3 in u3 || z(n3.style, l3, "");
    if (u3) for (l3 in u3) t4 && u3[l3] == t4[l3] || z(n3.style, l3, u3[l3]);
  }
  else if ("o" == l3[0] && "n" == l3[1]) r3 = l3 != (l3 = l3.replace(s, "$1")), o3 = l3.toLowerCase(), l3 = o3 in n3 || "onFocusOut" == l3 || "onFocusIn" == l3 ? o3.slice(2) : l3.slice(2), n3.l || (n3.l = {}), n3.l[l3 + r3] = u3, u3 ? t4 ? u3[a] = t4[a] : (u3[a] = h, n3.addEventListener(l3, r3 ? v : p, r3)) : n3.removeEventListener(l3, r3 ? v : p, r3);
  else {
    if ("http://www.w3.org/2000/svg" == i3) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n3) try {
      n3[l3] = null == u3 ? "" : u3;
      break n;
    } catch (n4) {
    }
    "function" == typeof u3 || (null == u3 || false === u3 && "-" != l3[4] ? n3.removeAttribute(l3) : n3.setAttribute(l3, "popover" == l3 && 1 == u3 ? "" : u3));
  }
}
function V(n3) {
  return function(u3) {
    if (this.l) {
      var t4 = this.l[u3.type + n3];
      if (null == u3[c]) u3[c] = h++;
      else if (u3[c] < t4[a]) return;
      return t4(l.event ? l.event(u3) : u3);
    }
  };
}
function q(n3, u3, t4, i3, r3, o3, e3, f3, c3, a3) {
  var s3, h3, p3, v3, y3, d3, _2, k3, x2, M, $2, I2, P2, A2, H2, T3, j3 = u3.type;
  if (void 0 !== u3.constructor) return null;
  128 & t4.__u && (c3 = !!(32 & t4.__u), o3 = [f3 = u3.__e = t4.__e]), (s3 = l.__b) && s3(u3);
  n: if ("function" == typeof j3) {
    h3 = e3.length;
    try {
      if (x2 = u3.props, M = j3.prototype && j3.prototype.render, $2 = (s3 = j3.contextType) && i3[s3.__c], I2 = s3 ? $2 ? $2.props.value : s3.__ : i3, t4.__c ? k3 = (p3 = u3.__c = t4.__c).__ = p3.__E : (M ? u3.__c = p3 = new j3(x2, I2) : (u3.__c = p3 = new C(x2, I2), p3.constructor = j3, p3.render = Q), $2 && $2.sub(p3), p3.state || (p3.state = {}), p3.__n = i3, v3 = p3.__d = true, p3.__h = [], p3._sb = []), M && null == p3.__s && (p3.__s = p3.state), M && null != j3.getDerivedStateFromProps && (p3.__s == p3.state && (p3.__s = m({}, p3.__s)), m(p3.__s, j3.getDerivedStateFromProps(x2, p3.__s))), y3 = p3.props, d3 = p3.state, p3.__v = u3, v3) M && null == j3.getDerivedStateFromProps && null != p3.componentWillMount && p3.componentWillMount(), M && null != p3.componentDidMount && p3.__h.push(p3.componentDidMount);
      else {
        if (M && null == j3.getDerivedStateFromProps && x2 !== y3 && null != p3.componentWillReceiveProps && p3.componentWillReceiveProps(x2, I2), u3.__v == t4.__v || !p3.__e && null != p3.shouldComponentUpdate && false === p3.shouldComponentUpdate(x2, p3.__s, I2)) {
          u3.__v != t4.__v && (p3.props = x2, p3.state = p3.__s, p3.__d = false), u3.__e = t4.__e, u3.__k = t4.__k, u3.__k.some(function(n4) {
            n4 && (n4.__ = u3);
          }), w.push.apply(p3.__h, p3._sb), p3._sb = [], p3.__h.length && e3.push(p3);
          break n;
        }
        null != p3.componentWillUpdate && p3.componentWillUpdate(x2, p3.__s, I2), M && null != p3.componentDidUpdate && p3.__h.push(function() {
          p3.componentDidUpdate(y3, d3, _2);
        });
      }
      if (p3.context = I2, p3.props = x2, p3.__P = n3, p3.__e = false, P2 = l.__r, A2 = 0, M) p3.state = p3.__s, p3.__d = false, P2 && P2(u3), s3 = p3.render(p3.props, p3.state, p3.context), w.push.apply(p3.__h, p3._sb), p3._sb = [];
      else do {
        p3.__d = false, P2 && P2(u3), s3 = p3.render(p3.props, p3.state, p3.context), p3.state = p3.__s;
      } while (p3.__d && ++A2 < 25);
      p3.state = p3.__s, null != p3.getChildContext && (i3 = m(m({}, i3), p3.getChildContext())), M && !v3 && null != p3.getSnapshotBeforeUpdate && (_2 = p3.getSnapshotBeforeUpdate(y3, d3)), H2 = null != s3 && s3.type === S && null == s3.key ? E(s3.props.children) : s3, f3 = L(n3, g(H2) ? H2 : [H2], u3, t4, i3, r3, o3, e3, f3, c3, a3), p3.base = u3.__e, u3.__u &= -161, p3.__h.length && e3.push(p3), k3 && (p3.__E = p3.__ = null);
    } catch (n4) {
      if (e3.length = h3, u3.__v = null, c3 || null != o3) {
        if (n4.then) {
          for (u3.__u |= c3 ? 160 : 128; f3 && 8 == f3.nodeType && f3.nextSibling; ) f3 = f3.nextSibling;
          null != o3 && (o3[o3.indexOf(f3)] = null), u3.__e = f3;
        } else if (null != o3) for (T3 = o3.length; T3--; ) b(o3[T3]);
      } else u3.__e = t4.__e;
      null == u3.__k && (u3.__k = t4.__k || []), n4.then || B(u3), l.__e(n4, u3, t4);
    }
  } else null == o3 && u3.__v == t4.__v ? (u3.__k = t4.__k, u3.__e = t4.__e) : f3 = u3.__e = G(t4.__e, u3, t4, i3, r3, o3, e3, c3, a3);
  return (s3 = l.diffed) && s3(u3), 128 & u3.__u ? void 0 : f3;
}
function B(n3) {
  n3 && (n3.__c && (n3.__c.__e = true), n3.__k && n3.__k.some(B));
}
function D(n3, u3, t4) {
  for (var i3 = 0; i3 < t4.length; i3++) J(t4[i3], t4[++i3], t4[++i3]);
  l.__c && l.__c(u3, n3), n3.some(function(u4) {
    try {
      n3 = u4.__h, u4.__h = [], n3.some(function(n4) {
        n4.call(u4);
      });
    } catch (n4) {
      l.__e(n4, u4.__v);
    }
  });
}
function E(n3) {
  return "object" != typeof n3 || null == n3 || n3.__b > 0 ? n3 : g(n3) ? n3.map(E) : void 0 !== n3.constructor ? null : m({}, n3);
}
function G(u3, t4, i3, r3, o3, e3, f3, c3, a3) {
  var s3, h3, p3, v3, y3, w3, _2, m3 = i3.props || d, k3 = t4.props, x2 = t4.type;
  if ("svg" == x2 ? o3 = "http://www.w3.org/2000/svg" : "math" == x2 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {
    for (s3 = 0; s3 < e3.length; s3++) if ((y3 = e3[s3]) && "setAttribute" in y3 == !!x2 && (x2 ? y3.localName == x2 : 3 == y3.nodeType)) {
      u3 = y3, e3[s3] = null;
      break;
    }
  }
  if (null == u3) {
    if (null == x2) return document.createTextNode(k3);
    u3 = document.createElementNS(o3, x2, k3.is && k3), c3 && (l.__m && l.__m(t4, e3), c3 = false), e3 = null;
  }
  if (null == x2) m3 === k3 || c3 && u3.data == k3 || (u3.data = k3);
  else {
    if (e3 = "textarea" == x2 && null != k3.defaultValue ? null : e3 && n.call(u3.childNodes), !c3 && null != e3) for (m3 = {}, s3 = 0; s3 < u3.attributes.length; s3++) m3[(y3 = u3.attributes[s3]).name] = y3.value;
    for (s3 in m3) y3 = m3[s3], "dangerouslySetInnerHTML" == s3 ? p3 = y3 : "children" == s3 || s3 in k3 || "value" == s3 && "defaultValue" in k3 || "checked" == s3 && "defaultChecked" in k3 || N(u3, s3, null, y3, o3);
    for (s3 in k3) y3 = k3[s3], "children" == s3 ? v3 = y3 : "dangerouslySetInnerHTML" == s3 ? h3 = y3 : "value" == s3 ? w3 = y3 : "checked" == s3 ? _2 = y3 : c3 && "function" != typeof y3 || m3[s3] === y3 || N(u3, s3, y3, m3[s3], o3);
    if (h3) c3 || p3 && (h3.__html == p3.__html || h3.__html == u3.innerHTML) || (u3.innerHTML = h3.__html), t4.__k = [];
    else if (p3 && (u3.innerHTML = ""), L("template" == t4.type ? u3.content : u3, g(v3) ? v3 : [v3], t4, i3, r3, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o3, e3, f3, e3 ? e3[0] : i3.__k && $(i3, 0), c3, a3), null != e3) for (s3 = e3.length; s3--; ) b(e3[s3]);
    c3 && "textarea" != x2 || (s3 = "value", "progress" == x2 && null == w3 ? u3.removeAttribute("value") : null != w3 && (w3 !== u3[s3] || "progress" == x2 && !w3 || "option" == x2 && w3 != m3[s3]) && N(u3, s3, w3, m3[s3], o3), s3 = "checked", null != _2 && _2 != u3[s3] && N(u3, s3, _2, m3[s3], o3));
  }
  return u3;
}
function J(n3, u3, t4) {
  try {
    if ("function" == typeof n3) {
      var i3 = "function" == typeof n3.__u;
      i3 && n3.__u(), i3 && null == u3 || (n3.__u = n3(u3));
    } else n3.current = u3;
  } catch (n4) {
    l.__e(n4, t4);
  }
}
function K(n3, u3, t4) {
  var i3, r3;
  if (l.unmount && l.unmount(n3), (i3 = n3.ref) && (i3.current && i3.current != n3.__e || J(i3, null, u3)), null != (i3 = n3.__c)) {
    if (i3.componentWillUnmount) try {
      i3.componentWillUnmount();
    } catch (n4) {
      l.__e(n4, u3);
    }
    i3.base = i3.__P = i3.__n = null;
  }
  if (i3 = n3.__k) for (r3 = 0; r3 < i3.length; r3++) i3[r3] && K(i3[r3], u3, t4 || "function" != typeof n3.type);
  t4 || b(n3.__e), n3.__c = n3.__ = n3.__e = void 0;
}
function Q(n3, l3, u3) {
  return this.constructor(n3, u3);
}
function R(u3, t4, i3) {
  var r3, o3, e3, f3;
  t4 == document && (t4 = document.documentElement), l.__ && l.__(u3, t4), o3 = (r3 = "function" == typeof i3) ? null : i3 && i3.__k || t4.__k, e3 = [], f3 = [], q(t4, u3 = (!r3 && i3 || t4).__k = k(S, null, [u3]), o3 || d, d, t4.namespaceURI, !r3 && i3 ? [i3] : o3 ? null : t4.firstChild ? n.call(t4.childNodes) : null, e3, !r3 && i3 ? i3 : o3 ? o3.__e : t4.firstChild, r3, f3), D(e3, u3, f3), u3.props.children = null;
}
n = w.slice, l = { __e: function(n3, l3, u3, t4) {
  for (var i3, r3, o3; l3 = l3.__; ) if ((i3 = l3.__c) && !i3.__) try {
    if ((r3 = i3.constructor) && null != r3.getDerivedStateFromError && (i3.setState(r3.getDerivedStateFromError(n3)), o3 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n3, t4 || {}), o3 = i3.__d), o3) return i3.__E = i3;
  } catch (l4) {
    n3 = l4;
  }
  throw n3;
} }, u = 0, t = function(n3) {
  return null != n3 && void 0 === n3.constructor;
}, C.prototype.setState = function(n3, l3) {
  var u3;
  u3 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m({}, this.state), "function" == typeof n3 && (n3 = n3(m({}, u3), this.props)), n3 && m(u3, n3), null != n3 && this.__v && (l3 && this._sb.push(l3), A(this));
}, C.prototype.forceUpdate = function(n3) {
  this.__v && (this.__e = true, n3 && this.__h.push(n3), A(this));
}, C.prototype.render = S, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n3, l3) {
  return n3.__v.__b - l3.__v.__b;
}, H.__r = 0, f = Math.random().toString(8), c = "__d" + f, a = "__a" + f, s = /(PointerCapture)$|Capture$/i, h = 0, p = V(false), v = V(true), y = 0;

// node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = l;
var e2 = c2.__b;
var a2 = c2.__r;
var v2 = c2.diffed;
var l2 = c2.__c;
var m2 = c2.unmount;
var p2 = c2.__;
function s2(n3, t4) {
  c2.__h && c2.__h(r2, n3, o2 || t4), o2 = 0;
  var u3 = r2.__H || (r2.__H = { __: [], __h: [] });
  return n3 >= u3.__.length && u3.__.push({}), u3.__[n3];
}
function d2(n3) {
  return o2 = 1, y2(D2, n3);
}
function y2(n3, u3, i3) {
  var o3 = s2(t2++, 2);
  if (o3.t = n3, !o3.__c && (o3.__ = [i3 ? i3(u3) : D2(void 0, u3), function(n4) {
    var t4 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t4, n4);
    t4 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
  }], o3.__c = r2, !r2.__f)) {
    var f3 = function(n4, t4, r3) {
      if (!o3.__c.__H) return true;
      var u4 = false, i4 = o3.__c.props !== n4;
      if (o3.__c.__H.__.some(function(n5) {
        if (n5.__N) {
          u4 = true;
          var t5 = n5.__[0];
          n5.__ = n5.__N, n5.__N = void 0, t5 !== n5.__[0] && (i4 = true);
        }
      }), c3) {
        var f4 = c3.call(this, n4, t4, r3);
        return u4 ? f4 || i4 : f4;
      }
      return !u4 || i4;
    };
    r2.__f = true;
    var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
    r2.componentWillUpdate = function(n4, t4, r3) {
      if (this.__e) {
        var u4 = c3;
        c3 = void 0, f3(n4, t4, r3), c3 = u4;
      }
      e3 && e3.call(this, n4, t4, r3);
    }, r2.shouldComponentUpdate = f3;
  }
  return o3.__N || o3.__;
}
function h2(n3, u3) {
  var i3 = s2(t2++, 3);
  !c2.__s && C2(i3.__H, u3) && (i3.__ = n3, i3.u = u3, r2.__H.__h.push(i3));
}
function T2(n3, r3) {
  var u3 = s2(t2++, 7);
  return C2(u3.__H, r3) && (u3.__ = n3(), u3.__H = r3, u3.__h = n3), u3.__;
}
function q2(n3, t4) {
  return o2 = 8, T2(function() {
    return n3;
  }, t4);
}
function j2() {
  for (var n3; n3 = f2.shift(); ) {
    var t4 = n3.__H;
    if (n3.__P && t4) try {
      t4.__h.some(z2), t4.__h.some(B2), t4.__h = [];
    } catch (r3) {
      t4.__h = [], c2.__e(r3, n3.__v);
    }
  }
}
c2.__b = function(n3) {
  r2 = null, e2 && e2(n3);
}, c2.__ = function(n3, t4) {
  n3 && t4.__k && t4.__k.__m && (n3.__m = t4.__k.__m), p2 && p2(n3, t4);
}, c2.__r = function(n3) {
  a2 && a2(n3), t2 = 0;
  var i3 = (r2 = n3.__c).__H;
  i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.some(function(n4) {
    n4.__N && (n4.__ = n4.__N), n4.u = n4.__N = void 0;
  })) : (i3.__h.some(z2), i3.__h.some(B2), i3.__h = [], t2 = 0)), u2 = r2;
}, c2.diffed = function(n3) {
  v2 && v2(n3);
  var t4 = n3.__c;
  t4 && t4.__H && (t4.__H.__h.length && (1 !== f2.push(t4) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t4.__H.__.some(function(n4) {
    n4.u && (n4.__H = n4.u, n4.u = void 0);
  })), u2 = r2 = null;
}, c2.__c = function(n3, t4) {
  t4.some(function(n4) {
    try {
      n4.__h.some(z2), n4.__h = n4.__h.filter(function(n5) {
        return !n5.__ || B2(n5);
      });
    } catch (r3) {
      t4.some(function(n5) {
        n5.__h && (n5.__h = []);
      }), t4 = [], c2.__e(r3, n4.__v);
    }
  }), l2 && l2(n3, t4);
}, c2.unmount = function(n3) {
  m2 && m2(n3);
  var t4, r3 = n3.__c;
  r3 && r3.__H && (r3.__H.__.some(function(n4) {
    try {
      z2(n4);
    } catch (n5) {
      t4 = n5;
    }
  }), r3.__H = void 0, t4 && c2.__e(t4, r3.__v));
};
var k2 = "function" == typeof requestAnimationFrame;
function w2(n3) {
  var t4, r3 = function() {
    clearTimeout(u3), k2 && cancelAnimationFrame(t4), setTimeout(n3);
  }, u3 = setTimeout(r3, 35);
  k2 && (t4 = requestAnimationFrame(r3));
}
function z2(n3) {
  var t4 = r2, u3 = n3.__c;
  "function" == typeof u3 && (n3.__c = void 0, u3()), r2 = t4;
}
function B2(n3) {
  var t4 = r2;
  n3.__c = n3.__(), r2 = t4;
}
function C2(n3, t4) {
  return !n3 || n3.length !== t4.length || t4.some(function(t5, r3) {
    return t5 !== n3[r3];
  });
}
function D2(n3, t4) {
  return "function" == typeof t4 ? t4(n3) : t4;
}

// node_modules/htm/dist/htm.module.js
var n2 = function(t4, s3, r3, e3) {
  var u3;
  s3[0] = 0;
  for (var h3 = 1; h3 < s3.length; h3++) {
    var p3 = s3[h3++], a3 = s3[h3] ? (s3[0] |= p3 ? 1 : 2, r3[s3[h3++]]) : s3[++h3];
    3 === p3 ? e3[0] = a3 : 4 === p3 ? e3[1] = Object.assign(e3[1] || {}, a3) : 5 === p3 ? (e3[1] = e3[1] || {})[s3[++h3]] = a3 : 6 === p3 ? e3[1][s3[++h3]] += a3 + "" : p3 ? (u3 = t4.apply(a3, n2(t4, a3, r3, ["", null])), e3.push(u3), a3[0] ? s3[0] |= 2 : (s3[h3 - 2] = 0, s3[h3] = u3)) : e3.push(a3);
  }
  return e3;
};
var t3 = /* @__PURE__ */ new Map();
function htm_module_default(s3) {
  var r3 = t3.get(this);
  return r3 || (r3 = /* @__PURE__ */ new Map(), t3.set(this, r3)), (r3 = n2(this, r3.get(s3) || (r3.set(s3, r3 = (function(n3) {
    for (var t4, s4, r4 = 1, e3 = "", u3 = "", h3 = [0], p3 = function(n4) {
      1 === r4 && (n4 || (e3 = e3.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? h3.push(0, n4, e3) : 3 === r4 && (n4 || e3) ? (h3.push(3, n4, e3), r4 = 2) : 2 === r4 && "..." === e3 && n4 ? h3.push(4, n4, 0) : 2 === r4 && e3 && !n4 ? h3.push(5, 0, true, e3) : r4 >= 5 && ((e3 || !n4 && 5 === r4) && (h3.push(r4, 0, e3, s4), r4 = 6), n4 && (h3.push(r4, n4, 0, s4), r4 = 6)), e3 = "";
    }, a3 = 0; a3 < n3.length; a3++) {
      a3 && (1 === r4 && p3(), p3(a3));
      for (var l3 = 0; l3 < n3[a3].length; l3++) t4 = n3[a3][l3], 1 === r4 ? "<" === t4 ? (p3(), h3 = [h3], r4 = 3) : e3 += t4 : 4 === r4 ? "--" === e3 && ">" === t4 ? (r4 = 1, e3 = "") : e3 = t4 + e3[0] : u3 ? t4 === u3 ? u3 = "" : e3 += t4 : '"' === t4 || "'" === t4 ? u3 = t4 : ">" === t4 ? (p3(), r4 = 1) : r4 && ("=" === t4 ? (r4 = 5, s4 = e3, e3 = "") : "/" === t4 && (r4 < 5 || ">" === n3[a3][l3 + 1]) ? (p3(), 3 === r4 && (h3 = h3[0]), r4 = h3, (h3 = h3[0]).push(2, 0, r4), r4 = 0) : " " === t4 || "	" === t4 || "\n" === t4 || "\r" === t4 ? (p3(), r4 = 2) : e3 += t4), 3 === r4 && "!--" === e3 && (r4 = 4, h3 = h3[0]);
    }
    return p3(), h3;
  })(s3)), r3), arguments, [])).length > 1 ? r3 : r3[0];
}

// public/app.ts
var html = htm_module_default.bind(k);
var MAX_MB = 50;
var POLL_INTERVAL_MS = 2500;
var ICONS = {
  upload: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3l5 5h-3v6h-4V8H7l5-5zm-7 13h14v2H5v-2z" />
  </svg>`,
  sparkle: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2zm7 10l1 2.9L23 16l-3 .9L19 20l-1-3.1L15 16l3-.9L19 12z"
    />
  </svg>`,
  clock: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v5.2l3.6 2.2-.9 1.5L11 13V7h2z"
    />
  </svg>`,
  archive: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h16v4H4V4zm2 6h12v10H6V10zm3 2v2h6v-2H9z" />
  </svg>`,
  info: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
    />
  </svg>`,
  check: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4-9.6 9.6z" />
  </svg>`
};
function App() {
  const [file, setFile] = d2(null);
  const [threshold, setThreshold] = d2(0.75);
  const [autoMode, setAutoMode] = d2(true);
  const [uploadId, setUploadId] = d2("");
  const [status, setStatus] = d2(
    "Select a .zip file and start processing."
  );
  const [summary, setSummary] = d2(null);
  const [download, setDownload] = d2(null);
  const [groups, setGroups] = d2([]);
  const [busy, setBusy] = d2(false);
  const [toasts, setToasts] = d2([]);
  const [finalizing, setFinalizing] = d2(false);
  h2(() => {
    const currentUploadId = new URL(window.location.href).searchParams.get("uploadId") || "";
    if (currentUploadId) {
      setUploadId(currentUploadId);
      setBusy(true);
      setStatus("Restoring upload session...");
    }
  }, []);
  h2(() => {
    const url = new URL(window.location.href);
    if (uploadId) {
      url.searchParams.set("uploadId", uploadId);
    } else {
      url.searchParams.delete("uploadId");
    }
    window.history.replaceState({}, "", url);
  }, [uploadId]);
  const pushToast = q2((kind, message) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);
  const canUpload = T2(() => {
    if (!file) {
      return false;
    }
    return file.size > 0 && file.size <= MAX_MB * 1024 * 1024;
  }, [file]);
  const fileLabel = file ? `${file.name} \xB7 ${(file.size / (1024 * 1024)).toFixed(1)} MB` : `Choose a .zip up to ${MAX_MB}MB`;
  h2(() => {
    if (file && file.size > MAX_MB * 1024 * 1024) {
      pushToast(
        "warning",
        `This file is larger than ${MAX_MB}MB and cannot be uploaded.`
      );
    }
  }, [file, pushToast]);
  h2(() => {
    if (!uploadId) {
      return;
    }
    let timer = null;
    const poll = async () => {
      try {
        const response = await fetch(`/api/uploads/${uploadId}`);
        const data = await response.json();
        if (!response.ok) {
          setStatus(data.error || "Unable to load status.");
          return;
        }
        setSummary(data.upload);
        setDownload(data.download);
        const currentStatus = data.upload?.status;
        if (currentStatus === "queued") {
          setStatus("Queued for processing...");
          return;
        }
        if (currentStatus === "processing") {
          setStatus("Scanning and de-duplicating songs...");
          return;
        }
        if (currentStatus === "ready") {
          setStatus("Done. Download your de-duplicated archive.");
          if (timer) {
            window.clearInterval(timer);
          }
          await loadGroups(uploadId);
          setBusy(false);
          pushToast("success", "Your de-duplicated archive is ready.");
          return;
        }
        if (currentStatus === "review") {
          if (timer) {
            window.clearInterval(timer);
          }
          await loadGroups(uploadId);
          setBusy(false);
          setStatus(
            "Review selections below."
          );
          pushToast(
            "info",
            "Selections are ready for review. Adjust if needed, then generate the archive."
          );
          return;
        }
        if (currentStatus === "failed") {
          const message = data.upload?.error_message || "Processing failed.";
          setStatus(message);
          if (timer) {
            window.clearInterval(timer);
          }
          setBusy(false);
          pushToast("error", message);
        }
      } catch {
        setStatus("Network issue while polling status.");
      }
    };
    void poll();
    timer = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);
    return () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [uploadId, pushToast]);
  const loadGroups = q2(async (nextUploadId) => {
    if (!nextUploadId) {
      setGroups([]);
      return;
    }
    try {
      const response = await fetch(
        `/api/duplicates?uploadId=${encodeURIComponent(nextUploadId)}`
      );
      const data = await response.json();
      if (response.ok) {
        setGroups(data.groups || []);
      }
    } catch {
      setGroups([]);
    }
  }, []);
  const submit = q2(
    async (event) => {
      event.preventDefault();
      if (!file || !canUpload) {
        setStatus("Please select a valid zip file up to 50MB.");
        return;
      }
      setBusy(true);
      setGroups([]);
      setSummary(null);
      setDownload(null);
      setStatus("Uploading zip to worker API...");
      try {
        const body = new FormData();
        body.set("file", file);
        body.set("threshold", String(threshold));
        body.set("autoMode", String(autoMode));
        const response = await fetch("/api/uploads", {
          method: "POST",
          body
        });
        const data = await response.json();
        if (!response.ok || !data.uploadId) {
          const message = data.error || "Upload failed.";
          setStatus(message);
          setBusy(false);
          pushToast("error", message);
          return;
        }
        setUploadId(data.uploadId);
        setStatus("Upload complete, waiting for processing...");
        pushToast(
          "info",
          "Upload received. Processing will continue in the background."
        );
      } catch {
        setStatus("Upload failed due to network error.");
        setBusy(false);
        pushToast("error", "Upload failed due to network error.");
      }
    },
    [autoMode, canUpload, file, pushToast, threshold]
  );
  const keepOne = q2(
    async (groupId, songId) => {
      try {
        const response = await fetch(`/api/groups/${groupId}/keep/${songId}`, {
          method: "POST"
        });
        const data = await response.json();
        if (!response.ok) {
          pushToast("error", data.error || "Failed to mark song as kept.");
          return;
        }
        await loadGroups(uploadId);
        if (typeof data.keptFiles === "number") {
          setSummary(
            (current) => current ? {
              ...current,
              ...data.keptFiles ? { kept_files: data.keptFiles } : {}
            } : current
          );
        }
        pushToast(
          "success",
          "Song marked as kept. Others in this group will be excluded."
        );
      } catch {
        pushToast("error", "Network error while saving choice.");
      }
    },
    [loadGroups, pushToast, uploadId]
  );
  const finalize = q2(async () => {
    if (!uploadId) return;
    setFinalizing(true);
    try {
      const response = await fetch(`/api/uploads/${uploadId}/finalize`, {
        method: "POST"
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        pushToast("error", data.error || "Finalize failed.");
        return;
      }
      setDownload({
        url: data.url,
        expiresAt: data.expiresAt || new Date(Date.now() + 7 * 864e5).toISOString()
      });
      setStatus("Done. Download your de-duplicated archive.");
      pushToast("success", "Archive generated. Download is ready.");
      const statusResp = await fetch(`/api/uploads/${uploadId}`);
      const statusData = await statusResp.json();
      if (statusData.upload) setSummary(statusData.upload);
    } catch {
      pushToast("error", "Network error during finalize.");
    } finally {
      setFinalizing(false);
    }
  }, [uploadId, pushToast]);
  const removeToast = q2((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const copyDownloadLink = q2(async () => {
    if (!download?.url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${download.url}`
      );
      pushToast("success", "Download link copied to clipboard.");
    } catch {
      pushToast("error", "Could not copy the link. Please copy it manually.");
    }
  }, [download, pushToast]);
  return html`
    <main className="shell">
      <div className="backdrop backdrop-a"></div>
      <div className="backdrop backdrop-b"></div>

      <section className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow">v1.1</p>
          <h1>ProPresenter Lyrics De-duplicator</h1>
          <p className="hero-text">
            Upload a zip once, process it in the background, and return later
            for a clean, shareable download link.
          </p>
          <div className="feature-row">
            <span className="chip">${ICONS.upload} 50MB max upload</span>
            <span className="chip">${ICONS.sparkle} Background scan</span>
            <span className="chip">${ICONS.archive} Download link</span>
          </div>
        </div>
      </section>

      <section className="grid-layout">
        <section className="panel uploader">
          <div className="panel-head">
            <div>
              <h2>Upload archive</h2>
              <p>
                Use a single zip file. The worker processes it asynchronously.
              </p>
            </div>
            <span
              className="hint"
              title="This keeps the app within Cloudflare free-tier limits."
              >${ICONS.info}</span
            >
          </div>

          <form onSubmit=${submit}>
            <label className="field file-field">
              <span>ZIP archive</span>
              <div className="file-picker ${file ? "has-file" : ""}">
                <input
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange=${(event) => {
    const target = event.target;
    setFile(target.files?.[0] ?? null);
  }}
                  disabled=${busy}
                />
                <div className="file-meta">
                  <strong>${fileLabel}</strong>
                  <span
                    >${file ? "Ready to upload" : "Choose a zip file that contains .txt files"}</span
                  >
                </div>
              </div>
            </label>

            <label className="field">
              <div className="field-label-row">
                <span>Duplicate threshold</span>
                <span className="value-pill"
                  >${(threshold * 100).toFixed(0)}%</span
                >
              </div>
              <input
                type="range"
                min="0.4"
                max="0.98"
                step="0.01"
                value=${threshold}
                onInput=${(event) => {
    const target = event.currentTarget;
    setThreshold(Number(target.value));
  }}
                disabled=${busy}
              />
            </label>

            <div className="actions-row">
              <button
                className="btn btn-primary"
                type="submit"
                disabled=${busy || !canUpload}
              >
                ${busy ? html`${ICONS.clock} Processing` : html`${ICONS.upload} Upload and process`}
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick=${() => void loadGroups(uploadId)}
                disabled=${!uploadId || busy}
              >
                Refresh results
              </button>
            </div>

            <label className="field toggle-field">
              <input
                type="checkbox"
                checked=${autoMode}
                onChange=${(e3) => setAutoMode(e3.target.checked)}
                disabled=${busy}
              />
              <span>Auto-select duplicates on upload</span>
              <small
                >When checked, best matches are preselected but you can still
                change them before finalizing</small
              >
            </label>
          </form>

          <div className="status-strip">
            <span className=${`status-badge ${summary?.status || "idle"}`}
              >${summary?.status || "idle"}</span
            >
            <p className="status">${status}</p>
          </div>
        </section>

        <aside className="panel steps-card">
          <h2>How it works</h2>
          <ol className="steps">
            <li>${ICONS.upload}<span>Upload one zip with your songs.</span></li>
            <li>
              ${ICONS.sparkle}<span
                >Worker queues and scans it in the background.</span
              >
            </li>
            <li>
              ${ICONS.check}<span
                >Download the deduplicated zip from a timed link.</span
              >
            </li>
          </ol>
        </aside>
      </section>

      ${summary ? html`
            <section className="panel metrics">
              <article>
                <strong>${summary.total_files || 0}</strong>
                <span>Total files</span>
              </article>
              <article>
                <strong>${summary.duplicate_groups || 0}</strong>
                <span>Duplicate groups</span>
              </article>
              <article>
                <strong>${summary.kept_files || 0}</strong>
                <span>Files kept</span>
              </article>
              <article>
                <strong>${summary.status}</strong>
                <span>Processing state</span>
              </article>
            </section>
          ` : null}
      ${download ? html`
            <section className="panel download">
              <div className="panel-head">
                <div>
                  <h2>De-duplicated archive ready</h2>
                  <p>
                    Download link expires on
                    ${new Date(download.expiresAt).toLocaleString()}.
                  </p>
                </div>
                <span
                  className="hint"
                  title="This link is safe to revisit until it expires."
                  >${ICONS.info}</span
                >
              </div>
              <div className="download-actions">
                <a href=${download.url} className="btn btn-primary"
                  >${ICONS.archive} Download zip</a
                >
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick=${copyDownloadLink}
                >
                  Copy link
                </button>
              </div>
            </section>
          ` : null}
      ${summary?.status === "review" ? html`
            <section className="panel review-cta">
              <div>
                <h2>
                  ${groups.length > 0 ? "Review complete?" : "No duplicates found"}
                </h2>
                <p>
                  ${groups.length > 0 ? "Review preselected choices or adjust them, then generate the deduplicated archive." : "This upload reached manual review mode, but no duplicate groups were detected above the current threshold. You can generate the archive as-is."}
                </p>
              </div>
              <button
                className="btn btn-primary"
                type="button"
                onClick=${finalize}
                disabled=${finalizing}
              >
                ${finalizing ? html`${ICONS.clock} Generating…` : html`${ICONS.archive} Generate download`}
              </button>
            </section>
          ` : null}
      ${groups.length > 0 ? html`
            <section className="panel groups">
              <div className="panel-head">
                <div>
                  <h2>Duplicate groups</h2>
                  <p>
                    ${summary?.status === "review" ? "Choose which file to keep in each group. Others will be excluded from the final download." : "Sorted by similarity. The first file in each group was kept automatically."}
                  </p>
                </div>
              </div>
              <div className="group-list">
                ${groups.map(
    (group) => html`
                    <article className="group-card" key=${group.id}>
                      <div className="group-card-head">
                        <h3>Group ${group.id}</h3>
                        <span>${group.members.length} files</span>
                      </div>
                      <div className="member-grid">
                        ${group.members.map((member) => {
      const groupHasSelection = summary?.status === "review" && group.members.some((entry) => entry.keptInOutput);
      const reviewState = summary?.status === "review" ? member.keptInOutput ? "selected" : groupHasSelection ? "discarded" : "pending" : member.keptInOutput ? "kept" : "discarded";
      return html`
                            <div
                              className=${`member-card ${reviewState}`}
                              key=${member.songId}
                            >
                              <div className="member-header">
                                <strong className="name"
                                  >${member.fileName}</strong
                                >
                                <span className="score"
                                  >${Math.round(member.score * 100)}%</span
                                >
                              </div>
                              ${summary?.status === "review" ? html`
                                    <div className="member-state-row">
                                      ${member.keptInOutput ? html`<span className="kept-label"
                                            >${ICONS.check} Selected to
                                            keep</span
                                          >` : groupHasSelection ? html`<span className="removed-label"
                                              >Will be discarded</span
                                            >` : html`<span className="pending-label"
                                              >Awaiting your choice</span
                                            >`}
                                    </div>
                                  ` : null}
                              <pre className="member-text">
${member.rawText}</pre
                              >
                              ${summary?.status === "review" ? html`
                                    <button
                                      className="btn btn-keep"
                                      type="button"
                                      onClick=${() => void keepOne(group.id, member.songId)}
                                      disabled=${member.keptInOutput}
                                    >
                                      ${member.keptInOutput ? html`${ICONS.check} Selected` : groupHasSelection ? "Keep instead" : html`${ICONS.check} Keep this one`}
                                    </button>
                                  ` : member.keptInOutput ? html`<span className="kept-label"
                                      >${ICONS.check} Kept</span
                                    >` : html`<span className="removed-label"
                                      >Excluded</span
                                    >`}
                            </div>
                          `;
    })}
                      </div>
                    </article>
                  `
  )}
              </div>
            </section>
          ` : null}

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        ${toasts.map(
    (toast) => html`
            <div className=${`toast ${toast.kind}`} key=${toast.id}>
              <div className="toast-mark">
                ${toast.kind === "success" ? ICONS.check : toast.kind === "warning" ? ICONS.info : ICONS.sparkle}
              </div>
              <p>${toast.message}</p>
              <button
                className="toast-close"
                type="button"
                onClick=${() => removeToast(toast.id)}
                aria-label="Dismiss toast"
              >
                ×
              </button>
            </div>
          `
  )}
      </div>
    </main>
  `;
}
var root = document.getElementById("root");
if (!root) {
  throw new Error("Missing #root element");
}
R(html`<${App} />`, root);
