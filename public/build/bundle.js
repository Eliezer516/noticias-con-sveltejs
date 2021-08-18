
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.42.1 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i].title;
    	child_ctx[7] = list[i].url;
    	child_ctx[8] = list[i].urlToImage;
    	return child_ctx;
    }

    // (52:2) {#each respuesta as {title, url, urlToImage}}
    function create_each_block(ctx) {
    	let div4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div3;
    	let div1;
    	let t1_value = /*title*/ ctx[6] + "";
    	let t1;
    	let t2;
    	let div2;
    	let a;
    	let t3;
    	let a_href_value;
    	let t4;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			a = element("a");
    			t3 = text("Seguir leyendo");
    			t4 = space();

    			if (!src_url_equal(img.src, img_src_value = /*urlToImage*/ ctx[8]
    			? /*urlToImage*/ ctx[8]
    			: 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg')) attr_dev(img, "src", img_src_value);

    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-fu8erk");
    			add_location(img, file, 54, 4, 1542);
    			attr_dev(div0, "class", "card-img");
    			add_location(div0, file, 53, 3, 1515);
    			attr_dev(div1, "class", "card-title svelte-fu8erk");
    			add_location(div1, file, 57, 4, 1726);

    			attr_dev(a, "href", a_href_value = /*url*/ ctx[7]
    			? /*url*/ ctx[7]
    			: 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg');

    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-fu8erk");
    			add_location(a, file, 58, 27, 1791);
    			attr_dev(div2, "class", "card-link");
    			add_location(div2, file, 58, 4, 1768);
    			attr_dev(div3, "class", "card_content svelte-fu8erk");
    			add_location(div3, file, 56, 3, 1695);
    			attr_dev(div4, "class", "card svelte-fu8erk");
    			add_location(div4, file, 52, 2, 1493);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, img);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, a);
    			append_dev(a, t3);
    			append_dev(div4, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*respuesta*/ 4 && !src_url_equal(img.src, img_src_value = /*urlToImage*/ ctx[8]
    			? /*urlToImage*/ ctx[8]
    			: 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg')) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*respuesta*/ 4 && t1_value !== (t1_value = /*title*/ ctx[6] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*respuesta*/ 4 && a_href_value !== (a_href_value = /*url*/ ctx[7]
    			? /*url*/ ctx[7]
    			: 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg')) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(52:2) {#each respuesta as {title, url, urlToImage}}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let nav;
    	let div0;
    	let h2;
    	let t1;
    	let div3;
    	let div1;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let t6;
    	let div2;
    	let select1;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let option10;
    	let option11;
    	let t15;
    	let section;
    	let mounted;
    	let dispose;
    	let each_value = /*respuesta*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			nav = element("nav");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "App de noticias con Sveltejs";
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Pais";
    			option1 = element("option");
    			option1.textContent = "Venezuela";
    			option2 = element("option");
    			option2.textContent = "Colombia";
    			option3 = element("option");
    			option3.textContent = "Argentina";
    			t6 = space();
    			div2 = element("div");
    			select1 = element("select");
    			option4 = element("option");
    			option4.textContent = "Categoria";
    			option5 = element("option");
    			option5.textContent = "General";
    			option6 = element("option");
    			option6.textContent = "Negocios";
    			option7 = element("option");
    			option7.textContent = "Entretenimiento";
    			option8 = element("option");
    			option8.textContent = "Salud";
    			option9 = element("option");
    			option9.textContent = "Ciencia";
    			option10 = element("option");
    			option10.textContent = "Deportes";
    			option11 = element("option");
    			option11.textContent = "Tecnologia";
    			t15 = space();
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h2, file, 24, 3, 533);
    			attr_dev(div0, "class", "title");
    			add_location(div0, file, 23, 2, 510);
    			option0.__value = "ve";
    			option0.value = option0.__value;
    			option0.selected = true;
    			option0.disabled = true;
    			attr_dev(option0, "class", "svelte-fu8erk");
    			add_location(option0, file, 29, 6, 687);
    			option1.__value = "ve";
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-fu8erk");
    			add_location(option1, file, 30, 6, 744);
    			option2.__value = "co";
    			option2.value = option2.__value;
    			attr_dev(option2, "class", "svelte-fu8erk");
    			add_location(option2, file, 31, 6, 788);
    			option3.__value = "ar";
    			option3.value = option3.__value;
    			attr_dev(option3, "class", "svelte-fu8erk");
    			add_location(option3, file, 32, 6, 831);
    			attr_dev(select0, "class", "select_box svelte-fu8erk");
    			if (/*paisDeOrigen*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[3].call(select0));
    			add_location(select0, file, 28, 4, 627);
    			attr_dev(div1, "class", "pais svelte-fu8erk");
    			add_location(div1, file, 27, 3, 604);
    			option4.__value = "general";
    			option4.value = option4.__value;
    			option4.selected = true;
    			option4.disabled = true;
    			attr_dev(option4, "class", "svelte-fu8erk");
    			add_location(option4, file, 37, 6, 981);
    			option5.__value = "general";
    			option5.value = option5.__value;
    			attr_dev(option5, "class", "svelte-fu8erk");
    			add_location(option5, file, 38, 6, 1048);
    			option6.__value = "business";
    			option6.value = option6.__value;
    			attr_dev(option6, "class", "svelte-fu8erk");
    			add_location(option6, file, 39, 6, 1095);
    			option7.__value = "entertainment";
    			option7.value = option7.__value;
    			attr_dev(option7, "class", "svelte-fu8erk");
    			add_location(option7, file, 40, 6, 1144);
    			option8.__value = "health";
    			option8.value = option8.__value;
    			attr_dev(option8, "class", "svelte-fu8erk");
    			add_location(option8, file, 41, 6, 1205);
    			option9.__value = "science";
    			option9.value = option9.__value;
    			attr_dev(option9, "class", "svelte-fu8erk");
    			add_location(option9, file, 42, 6, 1249);
    			option10.__value = "sports";
    			option10.value = option10.__value;
    			attr_dev(option10, "class", "svelte-fu8erk");
    			add_location(option10, file, 43, 6, 1296);
    			option11.__value = "technology";
    			option11.value = option11.__value;
    			attr_dev(option11, "class", "svelte-fu8erk");
    			add_location(option11, file, 44, 6, 1343);
    			attr_dev(select1, "class", "select_box svelte-fu8erk");
    			if (/*categoria*/ ctx[1] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[4].call(select1));
    			add_location(select1, file, 36, 4, 924);
    			attr_dev(div2, "class", "categoria svelte-fu8erk");
    			add_location(div2, file, 35, 3, 896);
    			attr_dev(div3, "class", "form svelte-fu8erk");
    			add_location(div3, file, 26, 2, 582);
    			attr_dev(nav, "class", "svelte-fu8erk");
    			add_location(nav, file, 22, 1, 502);
    			attr_dev(section, "class", "svelte-fu8erk");
    			add_location(section, file, 50, 1, 1433);
    			add_location(main, file, 20, 0, 493);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, nav);
    			append_dev(nav, div0);
    			append_dev(div0, h2);
    			append_dev(nav, t1);
    			append_dev(nav, div3);
    			append_dev(div3, div1);
    			append_dev(div1, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			select_option(select0, /*paisDeOrigen*/ ctx[0]);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, select1);
    			append_dev(select1, option4);
    			append_dev(select1, option5);
    			append_dev(select1, option6);
    			append_dev(select1, option7);
    			append_dev(select1, option8);
    			append_dev(select1, option9);
    			append_dev(select1, option10);
    			append_dev(select1, option11);
    			select_option(select1, /*categoria*/ ctx[1]);
    			append_dev(main, t15);
    			append_dev(main, section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[3]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*paisDeOrigen*/ 1) {
    				select_option(select0, /*paisDeOrigen*/ ctx[0]);
    			}

    			if (dirty & /*categoria*/ 2) {
    				select_option(select1, /*categoria*/ ctx[1]);
    			}

    			if (dirty & /*respuesta*/ 4) {
    				each_value = /*respuesta*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let respuesta = [];
    	let paisDeOrigen = 've';
    	let categoria = 'general';

    	const obtenerNoticias = async (paisDeOrigen, categoria) => {
    		const fetchData = await fetch(`https://newsapi.org/v2/top-headlines?country=${paisDeOrigen}&category=${categoria}&apiKey=1380d78ddac345b481518f6cffb95140`);
    		const json = await fetchData.json();
    		const response = await json.articles;
    		console.table(response);
    		$$invalidate(2, respuesta = response);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		paisDeOrigen = select_value(this);
    		$$invalidate(0, paisDeOrigen);
    	}

    	function select1_change_handler() {
    		categoria = select_value(this);
    		$$invalidate(1, categoria);
    	}

    	$$self.$capture_state = () => ({
    		respuesta,
    		paisDeOrigen,
    		categoria,
    		obtenerNoticias
    	});

    	$$self.$inject_state = $$props => {
    		if ('respuesta' in $$props) $$invalidate(2, respuesta = $$props.respuesta);
    		if ('paisDeOrigen' in $$props) $$invalidate(0, paisDeOrigen = $$props.paisDeOrigen);
    		if ('categoria' in $$props) $$invalidate(1, categoria = $$props.categoria);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*paisDeOrigen, categoria*/ 3) {
    			obtenerNoticias(paisDeOrigen, categoria);
    		}
    	};

    	return [
    		paisDeOrigen,
    		categoria,
    		respuesta,
    		select0_change_handler,
    		select1_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
