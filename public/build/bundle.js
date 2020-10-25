
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Header.svelte generated by Svelte v3.29.0 */

    const file = "src\\components\\Header.svelte";

    function create_fragment(ctx) {
    	let nav;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			nav.textContent = "Formio Data Uploader";
    			attr_dev(nav, "class", "nav svelte-1ha2kba");
    			add_location(nav, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\components\LiveEndPoint.svelte generated by Svelte v3.29.0 */

    const file$1 = "src\\components\\LiveEndPoint.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "API Path / Live Endpoint angeben";
    			t1 = space();
    			input = element("input");
    			add_location(div, file$1, 6, 0, 89);
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "type", "url");
    			attr_dev(input, "placeholder", "z.B: https://abcdefghijklmnop.form.io/");
    			add_location(input, file$1, 7, 0, 134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*val*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*val*/ 1) {
    				set_input_value(input, /*val*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LiveEndPoint", slots, []);
    	let { val } = $$props;
    	val = "https://wpjilvsfrouawvl.form.io/";
    	const writable_props = ["val"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LiveEndPoint> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		val = this.value;
    		$$invalidate(0, val);
    	}

    	$$self.$$set = $$props => {
    		if ("val" in $$props) $$invalidate(0, val = $$props.val);
    	};

    	$$self.$capture_state = () => ({ val });

    	$$self.$inject_state = $$props => {
    		if ("val" in $$props) $$invalidate(0, val = $$props.val);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [val, input_input_handler];
    }

    class LiveEndPoint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { val: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LiveEndPoint",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*val*/ ctx[0] === undefined && !("val" in props)) {
    			console.warn("<LiveEndPoint> was created without expected prop 'val'");
    		}
    	}

    	get val() {
    		throw new Error("<LiveEndPoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set val(value) {
    		throw new Error("<LiveEndPoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Recource.svelte generated by Svelte v3.29.0 */

    const file$2 = "src\\components\\Recource.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Recource Angeben";
    			t1 = space();
    			input = element("input");
    			attr_dev(div, "class", "mt-2");
    			add_location(div, file$2, 5, 0, 44);
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Recource Angeben");
    			add_location(input, file$2, 6, 0, 86);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*val*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*val*/ 1 && input.value !== /*val*/ ctx[0]) {
    				set_input_value(input, /*val*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Recource", slots, []);
    	let { val } = $$props;
    	const writable_props = ["val"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Recource> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		val = this.value;
    		$$invalidate(0, val);
    	}

    	$$self.$$set = $$props => {
    		if ("val" in $$props) $$invalidate(0, val = $$props.val);
    	};

    	$$self.$capture_state = () => ({ val });

    	$$self.$inject_state = $$props => {
    		if ("val" in $$props) $$invalidate(0, val = $$props.val);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [val, input_input_handler];
    }

    class Recource extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { val: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Recource",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*val*/ ctx[0] === undefined && !("val" in props)) {
    			console.warn("<Recource> was created without expected prop 'val'");
    		}
    	}

    	get val() {
    		throw new Error("<Recource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set val(value) {
    		throw new Error("<Recource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Feld.svelte generated by Svelte v3.29.0 */

    const file$3 = "src\\components\\Feld.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let span;
    	let t0_value = /*msg*/ ctx[1] + " (" + /*label*/ ctx[2] + ")" + "";
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			attr_dev(span, "class", "input-group-text");
    			attr_dev(span, "id", "inputGroup-sizing-sm");
    			add_location(span, file$3, 9, 6, 277);
    			attr_dev(div0, "class", "input-group-prepend");
    			add_location(div0, file$3, 8, 4, 236);
    			attr_dev(input, "placeholder", "Index zuordnen");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "aria-label", "Small");
    			attr_dev(input, "aria-describedby", "inputGroup-sizing-sm");
    			add_location(input, file$3, 11, 4, 379);
    			attr_dev(div1, "class", "input-group input-group");
    			add_location(div1, file$3, 7, 2, 193);
    			attr_dev(div2, "class", "flex mt-3");
    			add_location(div2, file$3, 4, 0, 55);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div1, t1);
    			append_dev(div1, input);
    			set_input_value(input, /*index*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*msg, label*/ 6 && t0_value !== (t0_value = /*msg*/ ctx[1] + " (" + /*label*/ ctx[2] + ")" + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*index*/ 1 && to_number(input.value) !== /*index*/ ctx[0]) {
    				set_input_value(input, /*index*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Feld", slots, []);
    	let { msg } = $$props, { index } = $$props, { label } = $$props;
    	const writable_props = ["msg", "index", "label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Feld> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		index = to_number(this.value);
    		$$invalidate(0, index);
    	}

    	$$self.$$set = $$props => {
    		if ("msg" in $$props) $$invalidate(1, msg = $$props.msg);
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    	};

    	$$self.$capture_state = () => ({ msg, index, label });

    	$$self.$inject_state = $$props => {
    		if ("msg" in $$props) $$invalidate(1, msg = $$props.msg);
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [index, msg, label, input_input_handler];
    }

    class Feld extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { msg: 1, index: 0, label: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Feld",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*msg*/ ctx[1] === undefined && !("msg" in props)) {
    			console.warn("<Feld> was created without expected prop 'msg'");
    		}

    		if (/*index*/ ctx[0] === undefined && !("index" in props)) {
    			console.warn("<Feld> was created without expected prop 'index'");
    		}

    		if (/*label*/ ctx[2] === undefined && !("label" in props)) {
    			console.warn("<Feld> was created without expected prop 'label'");
    		}
    	}

    	get msg() {
    		throw new Error("<Feld>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set msg(value) {
    		throw new Error("<Feld>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Feld>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Feld>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Feld>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Feld>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\DefinitionRenderer.svelte generated by Svelte v3.29.0 */
    const file$4 = "src\\components\\DefinitionRenderer.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (42:0) {:else}
    function create_else_block(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*errorMsg*/ ctx[3]);
    			add_location(div, file$4, 42, 2, 1414);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMsg*/ 8) set_data_dev(t, /*errorMsg*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(42:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (29:0) {#if !error}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	let each_value = /*components*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "border rounded pl-3 pr-3 pb-3 mt-3");
    			add_location(div, file$4, 29, 2, 810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*components, indexArray*/ 3) {
    				each_value = /*components*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(29:0) {#if !error}",
    		ctx
    	});

    	return block;
    }

    // (37:44) 
    function create_if_block_3(ctx) {
    	let feld;
    	let updating_index;
    	let current;

    	function feld_index_binding_2(value) {
    		/*feld_index_binding_2*/ ctx[7].call(null, value, /*i*/ ctx[10]);
    	}

    	let feld_props = {
    		msg: "Number Feld",
    		label: /*component*/ ctx[8].label
    	};

    	if (/*indexArray*/ ctx[0][/*i*/ ctx[10]] !== void 0) {
    		feld_props.index = /*indexArray*/ ctx[0][/*i*/ ctx[10]];
    	}

    	feld = new Feld({ props: feld_props, $$inline: true });
    	binding_callbacks.push(() => bind(feld, "index", feld_index_binding_2));

    	const block = {
    		c: function create() {
    			create_component(feld.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(feld, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const feld_changes = {};
    			if (dirty & /*components*/ 2) feld_changes.label = /*component*/ ctx[8].label;

    			if (!updating_index && dirty & /*indexArray*/ 1) {
    				updating_index = true;
    				feld_changes.index = /*indexArray*/ ctx[0][/*i*/ ctx[10]];
    				add_flush_callback(() => updating_index = false);
    			}

    			feld.$set(feld_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(feld.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(feld.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(feld, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(37:44) ",
    		ctx
    	});

    	return block;
    }

    // (35:46) 
    function create_if_block_2(ctx) {
    	let feld;
    	let updating_index;
    	let current;

    	function feld_index_binding_1(value) {
    		/*feld_index_binding_1*/ ctx[6].call(null, value, /*i*/ ctx[10]);
    	}

    	let feld_props = {
    		msg: "Text Area Feld",
    		label: /*component*/ ctx[8].label
    	};

    	if (/*indexArray*/ ctx[0][/*i*/ ctx[10]] !== void 0) {
    		feld_props.index = /*indexArray*/ ctx[0][/*i*/ ctx[10]];
    	}

    	feld = new Feld({ props: feld_props, $$inline: true });
    	binding_callbacks.push(() => bind(feld, "index", feld_index_binding_1));

    	const block = {
    		c: function create() {
    			create_component(feld.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(feld, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const feld_changes = {};
    			if (dirty & /*components*/ 2) feld_changes.label = /*component*/ ctx[8].label;

    			if (!updating_index && dirty & /*indexArray*/ 1) {
    				updating_index = true;
    				feld_changes.index = /*indexArray*/ ctx[0][/*i*/ ctx[10]];
    				add_flush_callback(() => updating_index = false);
    			}

    			feld.$set(feld_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(feld.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(feld.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(feld, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(35:46) ",
    		ctx
    	});

    	return block;
    }

    // (32:6) {#if component.type === "textfield"}
    function create_if_block_1(ctx) {
    	let feld;
    	let updating_index;
    	let current;

    	function feld_index_binding(value) {
    		/*feld_index_binding*/ ctx[5].call(null, value, /*i*/ ctx[10]);
    	}

    	let feld_props = {
    		msg: "Text Feld",
    		label: /*component*/ ctx[8].label
    	};

    	if (/*indexArray*/ ctx[0][/*i*/ ctx[10]] !== void 0) {
    		feld_props.index = /*indexArray*/ ctx[0][/*i*/ ctx[10]];
    	}

    	feld = new Feld({ props: feld_props, $$inline: true });
    	binding_callbacks.push(() => bind(feld, "index", feld_index_binding));

    	const block = {
    		c: function create() {
    			create_component(feld.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(feld, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const feld_changes = {};
    			if (dirty & /*components*/ 2) feld_changes.label = /*component*/ ctx[8].label;

    			if (!updating_index && dirty & /*indexArray*/ 1) {
    				updating_index = true;
    				feld_changes.index = /*indexArray*/ ctx[0][/*i*/ ctx[10]];
    				add_flush_callback(() => updating_index = false);
    			}

    			feld.$set(feld_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(feld.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(feld.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(feld, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(32:6) {#if component.type === \\\"textfield\\\"}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#each components as component, i}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*component*/ ctx[8].type === "textfield") return 0;
    		if (/*component*/ ctx[8].type === "textarea") return 1;
    		if (/*component*/ ctx[8].type === "number") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(31:4) {#each components as component, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*error*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DefinitionRenderer", slots, []);
    	let { components } = $$props;
    	let error = false, errorMsg;
    	let { indexArray = [] } = $$props;
    	let { keyArray = [] } = $$props;

    	// durch components loopen, daten Objekt vorbereiten
    	// console.log(components);
    	components.forEach(component => {
    		if (component.type === "textfield") {
    			let key = component.key;
    			keyArray.push(key);
    		} else if (component.type === "textarea") {
    			let key = component.key;
    			keyArray.push(key);
    		} else if (component.type === "number") {
    			let key = component.key;
    			keyArray.push(key);
    		} else if (component.type === "button") {
    			keyArray.push(null);
    		} else {
    			$$invalidate(2, error = true);
    			$$invalidate(3, errorMsg = "Component art nicht Unterstützt");
    		}
    	});

    	const writable_props = ["components", "indexArray", "keyArray"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DefinitionRenderer> was created with unknown prop '${key}'`);
    	});

    	function feld_index_binding(value, i) {
    		indexArray[i] = value;
    		$$invalidate(0, indexArray);
    	}

    	function feld_index_binding_1(value, i) {
    		indexArray[i] = value;
    		$$invalidate(0, indexArray);
    	}

    	function feld_index_binding_2(value, i) {
    		indexArray[i] = value;
    		$$invalidate(0, indexArray);
    	}

    	$$self.$$set = $$props => {
    		if ("components" in $$props) $$invalidate(1, components = $$props.components);
    		if ("indexArray" in $$props) $$invalidate(0, indexArray = $$props.indexArray);
    		if ("keyArray" in $$props) $$invalidate(4, keyArray = $$props.keyArray);
    	};

    	$$self.$capture_state = () => ({
    		Feld,
    		components,
    		error,
    		errorMsg,
    		indexArray,
    		keyArray
    	});

    	$$self.$inject_state = $$props => {
    		if ("components" in $$props) $$invalidate(1, components = $$props.components);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    		if ("errorMsg" in $$props) $$invalidate(3, errorMsg = $$props.errorMsg);
    		if ("indexArray" in $$props) $$invalidate(0, indexArray = $$props.indexArray);
    		if ("keyArray" in $$props) $$invalidate(4, keyArray = $$props.keyArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		indexArray,
    		components,
    		error,
    		errorMsg,
    		keyArray,
    		feld_index_binding,
    		feld_index_binding_1,
    		feld_index_binding_2
    	];
    }

    class DefinitionRenderer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			components: 1,
    			indexArray: 0,
    			keyArray: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DefinitionRenderer",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*components*/ ctx[1] === undefined && !("components" in props)) {
    			console.warn("<DefinitionRenderer> was created without expected prop 'components'");
    		}
    	}

    	get components() {
    		throw new Error("<DefinitionRenderer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set components(value) {
    		throw new Error("<DefinitionRenderer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indexArray() {
    		throw new Error("<DefinitionRenderer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indexArray(value) {
    		throw new Error("<DefinitionRenderer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keyArray() {
    		throw new Error("<DefinitionRenderer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keyArray(value) {
    		throw new Error("<DefinitionRenderer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\DropZone.svelte generated by Svelte v3.29.0 */

    const file$5 = "src\\components\\DropZone.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (33:18) 
    function create_if_block_1$1(ctx) {
    	let div;
    	let h5;
    	let t0;
    	let t1_value = /*fields*/ ctx[0].data.length - 2 + "";
    	let t1;
    	let t2;
    	let each_value = /*fields*/ ctx[0].data[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h5 = element("h5");
    			t0 = text("Die Anzahl der Datensätze Beträgt: ");
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h5, "class", "mb-3");
    			add_location(h5, file$5, 34, 3, 855);
    			attr_dev(div, "class", "border rounded p-3");
    			add_location(div, file$5, 33, 2, 818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h5);
    			append_dev(h5, t0);
    			append_dev(h5, t1);
    			append_dev(div, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fields*/ 1 && t1_value !== (t1_value = /*fields*/ ctx[0].data.length - 2 + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*fields*/ 1) {
    				each_value = /*fields*/ ctx[0].data[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(33:18) ",
    		ctx
    	});

    	return block;
    }

    // (29:1) {#if !dropEvent}
    function create_if_block$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "CSV Datei hier hinein ziehen";
    			attr_dev(div, "class", "dropzone text-center svelte-hkpsmx");
    			attr_dev(div, "ondragover", "return false");
    			add_location(div, file$5, 29, 2, 610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[7](div);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "dragenter", /*dragEnter*/ ctx[4], false, false, false),
    					listen_dev(div, "dragleave", /*dragLeave*/ ctx[5], false, false, false),
    					listen_dev(div, "drop", /*drop*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(29:1) {#if !dropEvent}",
    		ctx
    	});

    	return block;
    }

    // (36:3) {#each fields.data[0] as field, i}
    function create_each_block$1(ctx) {
    	let div;
    	let t_value = /*i*/ ctx[10] + ": " + /*field*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "alert alert-dark");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$5, 36, 4, 979);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fields*/ 1 && t_value !== (t_value = /*i*/ ctx[10] + ": " + /*field*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(36:3) {#each fields.data[0] as field, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (!/*dropEvent*/ ctx[1]) return create_if_block$1;
    		if (/*parsed*/ ctx[2]) return create_if_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "mt-5");
    			add_location(div, file$5, 27, 0, 569);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DropZone", slots, []);
    	let dropEvent = false, parsed = false, box;
    	let { fields } = $$props;

    	function dragEnter(el) {
    		$$invalidate(3, box.style.border = "thick dashed #cd6133", box);
    		$$invalidate(3, box.style.color = "gray", box);
    	}

    	function dragLeave() {
    		$$invalidate(3, box.style.border = "thick dashed #ffbe76", box);
    		$$invalidate(3, box.style.color = "#222f3e", box);
    	}

    	function drop(e) {
    		$$invalidate(1, dropEvent = true);
    		e.preventDefault();
    		let fr = new FileReader();

    		fr.onload = () => {
    			$$invalidate(0, fields = Papa.parse(fr.result));
    			$$invalidate(2, parsed = true);
    		};

    		fr.readAsText(e.dataTransfer.files[0]);
    	}

    	const writable_props = ["fields"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DropZone> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			box = $$value;
    			$$invalidate(3, box);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    	};

    	$$self.$capture_state = () => ({
    		dropEvent,
    		parsed,
    		box,
    		fields,
    		dragEnter,
    		dragLeave,
    		drop
    	});

    	$$self.$inject_state = $$props => {
    		if ("dropEvent" in $$props) $$invalidate(1, dropEvent = $$props.dropEvent);
    		if ("parsed" in $$props) $$invalidate(2, parsed = $$props.parsed);
    		if ("box" in $$props) $$invalidate(3, box = $$props.box);
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fields, dropEvent, parsed, box, dragEnter, dragLeave, drop, div_binding];
    }

    class DropZone extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { fields: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DropZone",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fields*/ ctx[0] === undefined && !("fields" in props)) {
    			console.warn("<DropZone> was created without expected prop 'fields'");
    		}
    	}

    	get fields() {
    		throw new Error("<DropZone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fields(value) {
    		throw new Error("<DropZone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Uploader.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file$6 = "src\\components\\Uploader.svelte";

    // (102:0) {:else}
    function create_else_block$1(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let t2_value = /*fields*/ ctx[0].length - 2 + "";
    	let t2;
    	let t3;
    	let t4;
    	let div2;
    	let div1;
    	let t5;
    	let t6;
    	let if_block1_anchor;
    	let if_block0 = !/*done*/ ctx[6] && create_if_block_3$1(ctx);
    	let if_block1 = /*done*/ ctx[6] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(/*j*/ ctx[1]);
    			t1 = text(" / ");
    			t2 = text(t2_value);
    			t3 = text(" Datensätze hochgeladen");
    			t4 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "mt-3");
    			add_location(div0, file$6, 102, 2, 2866);
    			attr_dev(div1, "class", "progress-bar");
    			attr_dev(div1, "role", "progressbar");
    			set_style(div1, "width", "0%");
    			attr_dev(div1, "aria-valuenow", "0");
    			attr_dev(div1, "aria-valuemin", "0");
    			attr_dev(div1, "aria-valuemax", "100");
    			add_location(div1, file$6, 106, 4, 2983);
    			attr_dev(div2, "class", "progress mt-3");
    			add_location(div2, file$6, 105, 2, 2950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			/*div1_binding*/ ctx[14](div1);
    			insert_dev(target, t5, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*j*/ 2) set_data_dev(t0, /*j*/ ctx[1]);
    			if (dirty & /*fields*/ 1 && t2_value !== (t2_value = /*fields*/ ctx[0].length - 2 + "")) set_data_dev(t2, t2_value);

    			if (!/*done*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(t6.parentNode, t6);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*done*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			/*div1_binding*/ ctx[14](null);
    			if (detaching) detach_dev(t5);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(102:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (100:19) 
    function create_if_block_1$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Upload Starten";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-success mt-3");
    			add_location(button, file$6, 100, 2, 2756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*startUpload*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(100:19) ",
    		ctx
    	});

    	return block;
    }

    // (98:0) {#if error}
    function create_if_block$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*errorMsg*/ ctx[4]);
    			attr_dev(div, "class", "alert alert-danger mt-3");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$6, 98, 2, 2665);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMsg*/ 16) set_data_dev(t, /*errorMsg*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(98:0) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (109:2) {#if !done}
    function create_if_block_3$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Upload stoppen";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-danger mt-3");
    			add_location(button, file$6, 109, 4, 3163);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(109:2) {#if !done}",
    		ctx
    	});

    	return block;
    }

    // (114:2) {#if done}
    function create_if_block_2$1(ctx) {
    	let div;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Datenbank erfolgreich hochgeladen";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Zurücksetzten";
    			attr_dev(div, "class", "alert alert-success mt-3");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$6, 114, 4, 3316);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-danger");
    			add_location(button, file$6, 117, 4, 3426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[16], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(114:2) {#if done}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*error*/ ctx[3]) return create_if_block$2;
    		if (!/*pressed*/ ctx[2]) return create_if_block_1$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Uploader", slots, []);

    	let { fields } = $$props,
    		{ apiPath } = $$props,
    		{ recource } = $$props,
    		{ keyArray } = $$props,
    		{ indexArray } = $$props,
    		{ components } = $$props;

    	let j = 1, pressed = false, error = false, errorMsg, progress = 0, onePercent;
    	let progressBar, done = false, uploadActive = false;
    	fields = fields.data;

    	function startUpload() {
    		$$invalidate(2, pressed = true);
    		$$invalidate(7, uploadActive = true);

    		// compute Progress
    		onePercent = (fields.length - 2) / 100;

    		upload();
    	}

    	function updateProgress() {
    		progress = j / onePercent;
    		$$invalidate(5, progressBar.style.width = progress + "%", progressBar);
    	}

    	function reset() {
    		$$invalidate(2, pressed = false);
    	} // progress = 0;
    	// j = 1;

    	// progressBar.style.width = progress+"%";
    	function upload() {
    		// Daten Objekt erstellen
    		let data = {};

    		// console.log(keyArray, components, fields);
    		for (let i = 0; i < indexArray.length; i++) {
    			// sollte gleiche Länge wie die Components haben
    			if (components[i].type === "textfield") {
    				data[keyArray[i]] = fields[j][indexArray[i]];
    			} else if (components[i].type === "textarea") {
    				data[keyArray[i]] = fields[j][indexArray[i]];
    			} else if (components[i].type === "number") {
    				let pointCounter = 0, str = fields[j][indexArray[i]];

    				for (let k = 0; k < str.length; k++) {
    					switch (str.charAt(k)) {
    						case ",":
    							$$invalidate(3, error = true);
    							$$invalidate(4, errorMsg = "Komma statt Punkt verwendet in Zeile: " + (j + 1));
    							return;
    						case ".":
    							pointCounter++;
    							if (pointCounter > 1) {
    								$$invalidate(3, error = true);
    								$$invalidate(4, errorMsg = "Mehrere Punkte in einer Nummer in Zeile: " + (j + 1));
    								return;
    							} else {
    								break;
    							}
    					}
    				}

    				data[keyArray[i]] = parseFloat(fields[j][indexArray[i]]);
    			} else {
    				$$invalidate(3, error = true);
    				$$invalidate(4, errorMsg = "Component nicht Unterstützt.");
    				return;
    			}
    		}

    		data = JSON.stringify({ data });

    		fetch(apiPath + "/" + recource + "/submission", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: data
    		}).then(res => res.json()).then(body => {
    			// console.log("Antwort", body);
    			updateProgress();

    			if (j === fields.length - 2) {
    				$$invalidate(6, done = true);
    				return;
    			}

    			 // NOTE: Papaparse Bug verursacht noch eine lehre Array am ende
    			$$invalidate(1, j++, j);
    			uploadActive ? upload() : reset();
    		}).catch(er => {
    			// TODO: errorhandling
    			console.log(er);

    			$$invalidate(3, error = true);
    			$$invalidate(4, errorMsg = er);
    		});
    	}

    	const writable_props = ["fields", "apiPath", "recource", "keyArray", "indexArray", "components"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Uploader> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			progressBar = $$value;
    			$$invalidate(5, progressBar);
    		});
    	}

    	const click_handler = _ => $$invalidate(7, uploadActive = false);
    	const click_handler_1 = _ => window.location.reload();

    	$$self.$$set = $$props => {
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("apiPath" in $$props) $$invalidate(9, apiPath = $$props.apiPath);
    		if ("recource" in $$props) $$invalidate(10, recource = $$props.recource);
    		if ("keyArray" in $$props) $$invalidate(11, keyArray = $$props.keyArray);
    		if ("indexArray" in $$props) $$invalidate(12, indexArray = $$props.indexArray);
    		if ("components" in $$props) $$invalidate(13, components = $$props.components);
    	};

    	$$self.$capture_state = () => ({
    		fields,
    		apiPath,
    		recource,
    		keyArray,
    		indexArray,
    		components,
    		j,
    		pressed,
    		error,
    		errorMsg,
    		progress,
    		onePercent,
    		progressBar,
    		done,
    		uploadActive,
    		startUpload,
    		updateProgress,
    		reset,
    		upload
    	});

    	$$self.$inject_state = $$props => {
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("apiPath" in $$props) $$invalidate(9, apiPath = $$props.apiPath);
    		if ("recource" in $$props) $$invalidate(10, recource = $$props.recource);
    		if ("keyArray" in $$props) $$invalidate(11, keyArray = $$props.keyArray);
    		if ("indexArray" in $$props) $$invalidate(12, indexArray = $$props.indexArray);
    		if ("components" in $$props) $$invalidate(13, components = $$props.components);
    		if ("j" in $$props) $$invalidate(1, j = $$props.j);
    		if ("pressed" in $$props) $$invalidate(2, pressed = $$props.pressed);
    		if ("error" in $$props) $$invalidate(3, error = $$props.error);
    		if ("errorMsg" in $$props) $$invalidate(4, errorMsg = $$props.errorMsg);
    		if ("progress" in $$props) progress = $$props.progress;
    		if ("onePercent" in $$props) onePercent = $$props.onePercent;
    		if ("progressBar" in $$props) $$invalidate(5, progressBar = $$props.progressBar);
    		if ("done" in $$props) $$invalidate(6, done = $$props.done);
    		if ("uploadActive" in $$props) $$invalidate(7, uploadActive = $$props.uploadActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fields,
    		j,
    		pressed,
    		error,
    		errorMsg,
    		progressBar,
    		done,
    		uploadActive,
    		startUpload,
    		apiPath,
    		recource,
    		keyArray,
    		indexArray,
    		components,
    		div1_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class Uploader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			fields: 0,
    			apiPath: 9,
    			recource: 10,
    			keyArray: 11,
    			indexArray: 12,
    			components: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Uploader",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fields*/ ctx[0] === undefined && !("fields" in props)) {
    			console_1.warn("<Uploader> was created without expected prop 'fields'");
    		}

    		if (/*apiPath*/ ctx[9] === undefined && !("apiPath" in props)) {
    			console_1.warn("<Uploader> was created without expected prop 'apiPath'");
    		}

    		if (/*recource*/ ctx[10] === undefined && !("recource" in props)) {
    			console_1.warn("<Uploader> was created without expected prop 'recource'");
    		}

    		if (/*keyArray*/ ctx[11] === undefined && !("keyArray" in props)) {
    			console_1.warn("<Uploader> was created without expected prop 'keyArray'");
    		}

    		if (/*indexArray*/ ctx[12] === undefined && !("indexArray" in props)) {
    			console_1.warn("<Uploader> was created without expected prop 'indexArray'");
    		}

    		if (/*components*/ ctx[13] === undefined && !("components" in props)) {
    			console_1.warn("<Uploader> was created without expected prop 'components'");
    		}
    	}

    	get fields() {
    		throw new Error("<Uploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fields(value) {
    		throw new Error("<Uploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get apiPath() {
    		throw new Error("<Uploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set apiPath(value) {
    		throw new Error("<Uploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get recource() {
    		throw new Error("<Uploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set recource(value) {
    		throw new Error("<Uploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keyArray() {
    		throw new Error("<Uploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keyArray(value) {
    		throw new Error("<Uploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indexArray() {
    		throw new Error("<Uploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indexArray(value) {
    		throw new Error("<Uploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get components() {
    		throw new Error("<Uploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set components(value) {
    		throw new Error("<Uploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.29.0 */

    const { console: console_1$1 } = globals;
    const file$7 = "src\\App.svelte";

    // (37:2) {#if error}
    function create_if_block_2$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*errorMsg*/ ctx[3]);
    			attr_dev(div, "class", "alert alert-danger");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$7, 37, 3, 1112);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMsg*/ 8) set_data_dev(t, /*errorMsg*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(37:2) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (47:1) {#if definition}
    function create_if_block_1$3(ctx) {
    	let definitionrenderer;
    	let updating_indexArray;
    	let updating_keyArray;
    	let updating_components;
    	let current;

    	function definitionrenderer_indexArray_binding(value) {
    		/*definitionrenderer_indexArray_binding*/ ctx[12].call(null, value);
    	}

    	function definitionrenderer_keyArray_binding(value) {
    		/*definitionrenderer_keyArray_binding*/ ctx[13].call(null, value);
    	}

    	function definitionrenderer_components_binding(value) {
    		/*definitionrenderer_components_binding*/ ctx[14].call(null, value);
    	}

    	let definitionrenderer_props = {};

    	if (/*indexArray*/ ctx[7] !== void 0) {
    		definitionrenderer_props.indexArray = /*indexArray*/ ctx[7];
    	}

    	if (/*keyArray*/ ctx[6] !== void 0) {
    		definitionrenderer_props.keyArray = /*keyArray*/ ctx[6];
    	}

    	if (/*definition*/ ctx[4].components !== void 0) {
    		definitionrenderer_props.components = /*definition*/ ctx[4].components;
    	}

    	definitionrenderer = new DefinitionRenderer({
    			props: definitionrenderer_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(definitionrenderer, "indexArray", definitionrenderer_indexArray_binding));
    	binding_callbacks.push(() => bind(definitionrenderer, "keyArray", definitionrenderer_keyArray_binding));
    	binding_callbacks.push(() => bind(definitionrenderer, "components", definitionrenderer_components_binding));

    	const block = {
    		c: function create() {
    			create_component(definitionrenderer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(definitionrenderer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const definitionrenderer_changes = {};

    			if (!updating_indexArray && dirty & /*indexArray*/ 128) {
    				updating_indexArray = true;
    				definitionrenderer_changes.indexArray = /*indexArray*/ ctx[7];
    				add_flush_callback(() => updating_indexArray = false);
    			}

    			if (!updating_keyArray && dirty & /*keyArray*/ 64) {
    				updating_keyArray = true;
    				definitionrenderer_changes.keyArray = /*keyArray*/ ctx[6];
    				add_flush_callback(() => updating_keyArray = false);
    			}

    			if (!updating_components && dirty & /*definition*/ 16) {
    				updating_components = true;
    				definitionrenderer_changes.components = /*definition*/ ctx[4].components;
    				add_flush_callback(() => updating_components = false);
    			}

    			definitionrenderer.$set(definitionrenderer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(definitionrenderer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(definitionrenderer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(definitionrenderer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(47:1) {#if definition}",
    		ctx
    	});

    	return block;
    }

    // (50:1) {#if definition && fields}
    function create_if_block$3(ctx) {
    	let uploader;
    	let current;

    	uploader = new Uploader({
    			props: {
    				components: /*definition*/ ctx[4].components,
    				indexArray: /*indexArray*/ ctx[7],
    				keyArray: /*keyArray*/ ctx[6],
    				fields: /*fields*/ ctx[5],
    				apiPath: /*apiPath*/ ctx[1],
    				recource: /*recource*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(uploader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(uploader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const uploader_changes = {};
    			if (dirty & /*definition*/ 16) uploader_changes.components = /*definition*/ ctx[4].components;
    			if (dirty & /*indexArray*/ 128) uploader_changes.indexArray = /*indexArray*/ ctx[7];
    			if (dirty & /*keyArray*/ 64) uploader_changes.keyArray = /*keyArray*/ ctx[6];
    			if (dirty & /*fields*/ 32) uploader_changes.fields = /*fields*/ ctx[5];
    			if (dirty & /*apiPath*/ 2) uploader_changes.apiPath = /*apiPath*/ ctx[1];
    			if (dirty & /*recource*/ 1) uploader_changes.recource = /*recource*/ ctx[0];
    			uploader.$set(uploader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uploader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uploader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uploader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(50:1) {#if definition && fields}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let header;
    	let t0;
    	let main;
    	let div0;
    	let liveendpoint;
    	let updating_val;
    	let t1;
    	let recource_1;
    	let updating_val_1;
    	let br;
    	let t2;
    	let t3;
    	let button;
    	let t5;
    	let div1;
    	let dropzone;
    	let updating_fields;
    	let t6;
    	let t7;
    	let current;
    	let mounted;
    	let dispose;
    	header = new Header({ $$inline: true });

    	function liveendpoint_val_binding(value) {
    		/*liveendpoint_val_binding*/ ctx[9].call(null, value);
    	}

    	let liveendpoint_props = {};

    	if (/*apiPath*/ ctx[1] !== void 0) {
    		liveendpoint_props.val = /*apiPath*/ ctx[1];
    	}

    	liveendpoint = new LiveEndPoint({
    			props: liveendpoint_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(liveendpoint, "val", liveendpoint_val_binding));

    	function recource_1_val_binding(value) {
    		/*recource_1_val_binding*/ ctx[10].call(null, value);
    	}

    	let recource_1_props = {};

    	if (/*recource*/ ctx[0] !== void 0) {
    		recource_1_props.val = /*recource*/ ctx[0];
    	}

    	recource_1 = new Recource({ props: recource_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(recource_1, "val", recource_1_val_binding));
    	let if_block0 = /*error*/ ctx[2] && create_if_block_2$2(ctx);

    	function dropzone_fields_binding(value) {
    		/*dropzone_fields_binding*/ ctx[11].call(null, value);
    	}

    	let dropzone_props = {};

    	if (/*fields*/ ctx[5] !== void 0) {
    		dropzone_props.fields = /*fields*/ ctx[5];
    	}

    	dropzone = new DropZone({ props: dropzone_props, $$inline: true });
    	binding_callbacks.push(() => bind(dropzone, "fields", dropzone_fields_binding));
    	let if_block1 = /*definition*/ ctx[4] && create_if_block_1$3(ctx);
    	let if_block2 = /*definition*/ ctx[4] && /*fields*/ ctx[5] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			div0 = element("div");
    			create_component(liveendpoint.$$.fragment);
    			t1 = space();
    			create_component(recource_1.$$.fragment);
    			br = element("br");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			button = element("button");
    			button.textContent = "Bestätigen";
    			t5 = space();
    			div1 = element("div");
    			create_component(dropzone.$$.fragment);
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			if (if_block2) if_block2.c();
    			add_location(br, file$7, 35, 33, 1088);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$7, 41, 2, 1197);
    			attr_dev(div0, "class", "mt-5");
    			add_location(div0, file$7, 33, 1, 997);
    			attr_dev(div1, "class", "mt-3");
    			add_location(div1, file$7, 43, 1, 1301);
    			attr_dev(main, "class", "container mb-5");
    			add_location(main, file$7, 32, 0, 965);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(liveendpoint, div0, null);
    			append_dev(div0, t1);
    			mount_component(recource_1, div0, null);
    			append_dev(div0, br);
    			append_dev(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t3);
    			append_dev(div0, button);
    			append_dev(main, t5);
    			append_dev(main, div1);
    			mount_component(dropzone, div1, null);
    			append_dev(main, t6);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t7);
    			if (if_block2) if_block2.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*fetchDefinition*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const liveendpoint_changes = {};

    			if (!updating_val && dirty & /*apiPath*/ 2) {
    				updating_val = true;
    				liveendpoint_changes.val = /*apiPath*/ ctx[1];
    				add_flush_callback(() => updating_val = false);
    			}

    			liveendpoint.$set(liveendpoint_changes);
    			const recource_1_changes = {};

    			if (!updating_val_1 && dirty & /*recource*/ 1) {
    				updating_val_1 = true;
    				recource_1_changes.val = /*recource*/ ctx[0];
    				add_flush_callback(() => updating_val_1 = false);
    			}

    			recource_1.$set(recource_1_changes);

    			if (/*error*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			const dropzone_changes = {};

    			if (!updating_fields && dirty & /*fields*/ 32) {
    				updating_fields = true;
    				dropzone_changes.fields = /*fields*/ ctx[5];
    				add_flush_callback(() => updating_fields = false);
    			}

    			dropzone.$set(dropzone_changes);

    			if (/*definition*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*definition*/ 16) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t7);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*definition*/ ctx[4] && /*fields*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*definition, fields*/ 48) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$3(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(liveendpoint.$$.fragment, local);
    			transition_in(recource_1.$$.fragment, local);
    			transition_in(dropzone.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(liveendpoint.$$.fragment, local);
    			transition_out(recource_1.$$.fragment, local);
    			transition_out(dropzone.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(liveendpoint);
    			destroy_component(recource_1);
    			if (if_block0) if_block0.d();
    			destroy_component(dropzone);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let recource, apiPath, error = false, errorMsg, definition;
    	let fields, keyArray, indexArray;

    	async function fetchDefinition() {
    		// Definition von formio holen
    		// validierung der Inputs
    		if (!recource || !apiPath) {
    			$$invalidate(2, error = true);
    			$$invalidate(3, errorMsg = "Bitte füllen sie zuerst die Felder aus");
    		} else {
    			$$invalidate(2, error = false);

    			await fetch(apiPath + "/" + recource).then(res => res.json()).then(body => $$invalidate(4, definition = body)).catch(msg => {
    				console.log(msg);
    				$$invalidate(2, error = true);
    				$$invalidate(3, errorMsg = "Die angegebene Url ist fehlerhaft");
    			});
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function liveendpoint_val_binding(value) {
    		apiPath = value;
    		$$invalidate(1, apiPath);
    	}

    	function recource_1_val_binding(value) {
    		recource = value;
    		$$invalidate(0, recource);
    	}

    	function dropzone_fields_binding(value) {
    		fields = value;
    		$$invalidate(5, fields);
    	}

    	function definitionrenderer_indexArray_binding(value) {
    		indexArray = value;
    		$$invalidate(7, indexArray);
    	}

    	function definitionrenderer_keyArray_binding(value) {
    		keyArray = value;
    		$$invalidate(6, keyArray);
    	}

    	function definitionrenderer_components_binding(value) {
    		definition.components = value;
    		$$invalidate(4, definition);
    	}

    	$$self.$capture_state = () => ({
    		Header,
    		LiveEndPoint,
    		Recource,
    		DefinitionRenderer,
    		DropZone,
    		Uploader,
    		recource,
    		apiPath,
    		error,
    		errorMsg,
    		definition,
    		fields,
    		keyArray,
    		indexArray,
    		fetchDefinition
    	});

    	$$self.$inject_state = $$props => {
    		if ("recource" in $$props) $$invalidate(0, recource = $$props.recource);
    		if ("apiPath" in $$props) $$invalidate(1, apiPath = $$props.apiPath);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    		if ("errorMsg" in $$props) $$invalidate(3, errorMsg = $$props.errorMsg);
    		if ("definition" in $$props) $$invalidate(4, definition = $$props.definition);
    		if ("fields" in $$props) $$invalidate(5, fields = $$props.fields);
    		if ("keyArray" in $$props) $$invalidate(6, keyArray = $$props.keyArray);
    		if ("indexArray" in $$props) $$invalidate(7, indexArray = $$props.indexArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		recource,
    		apiPath,
    		error,
    		errorMsg,
    		definition,
    		fields,
    		keyArray,
    		indexArray,
    		fetchDefinition,
    		liveendpoint_val_binding,
    		recource_1_val_binding,
    		dropzone_fields_binding,
    		definitionrenderer_indexArray_binding,
    		definitionrenderer_keyArray_binding,
    		definitionrenderer_components_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
