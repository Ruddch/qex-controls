ns.models.select = Backbone.Model.extend(
    {
        'defaults': {
            'open':        false,
            'size':        'M',
            'placeholder': 'none',
            'mode':        'radio',
            'delim':       ',',
            'index':       {},
            'filtered':    {},
            'disabled':    false,
            'focus':       void(0),
            'label':       void(0),
            'selected':    void(0),
            'type':        void(0),
            'viewButton':  void(0),
            'viewOption':  void(0),
            'allowEmpty':  false
        },

        'initialize': function ns_models_select(attrs) {
            if (!attrs || !('options' in attrs)){
                throw "i::select: incorrect options";
            }
            attrs.options.length || attrs.allowEmpty || this.set('disabled', true);
            this.on('change:selected', this.selectedHandler);
            this.on('change:open',     this.openHandler);
            this.reset();
        },

        'reset': function(){
            this.set('index',    this.getIndex(true));
            this.set('selected', this.getSelected());
        },

        'openHandler': function(select, value){
            value && this.set('focus', void(0));
        },

        'selectedHandler': function(select, value){
            var type = this.get('type'),
                isCheck = this.isCheck(),
                placeholder = this.get('placeholder'),
                label = placeholder;

            if(value){
                if(value.length!==0){
                    if(type==='string' || type==='array'){
                        label = value;
                    } else if(type==='collection'){
                        if(isCheck){
                            label = value
                                    .map(this.getOptionLabel.bind(this))
                                    .join(this.get("delim"));
                        } else {
                            label = value.has('label') ? value.get('label') : value.cid;
                        }
                    }
                }
            }
            if(isCheck){
                this.set('checked', (label !== placeholder));
            }
            this.set('label', label);
        },

        'toggleOpen': function(open){
            this.set(
                'open',
                open===(void 0) ? !this.get('open') : !!open
            );
        },

        'selectFocused': function(){
            var open = this.get("open"),
                focus = this.get("focus");
            if(this.get("open") && this.get("focus")){
                this.selectByCid(
                    this.get("focus")
                );
            }
            this.toggleOpen(!open || this.isCheck() && focus);
        },

        'select': function(value){
            if (!value){
                return
            }
            var select = this,
                type = this.get('type'),
                options = this.get('options'),
                isCheck = this.isCheck(),
                cid,
                selected;

            if(typeof value === 'string'){
                selected = options.where({label: value});
            } else if(value instanceof Backbone.Model){
                select.selectByCid(value.cid);
                return this;
            } else {
                return
            }

            if(selected.length){
                selected.forEach(
                    function(option){
                        select.selectByCid(option.cid);
                    }
                )
            } else {
                this.reset();
            }
            return this;
        },

        'getIndex': function(reset){
            var old   = this.get('index'),
                index = {};
            if(!reset){
                this.get('options').forEach(
                    function(option){
                        index[option.cid] = option.cid in old ? old[option.cid] : false;
                    },
                    this
                );
            }
            return index;
        },

        'getSelected': function(_type){
            var type     = _type || this.get("type"),
                index    = this.get("index"),
                options  = this.get("options"),
                isCheck  = this.isCheck(),
                selected = [],
                option,
                id;

            for(id in index){
                if(index[id]){
                    option = options.get({cid: id});
                    selected.push(option);
                }
            }

            if (type === 'string') {
                selected = selected.join(this.get("delim"));
            } else {
                if (!isCheck) {
                    selected = selected.length ? selected[0] : null;
                }
            }
            return selected;
        },

        'getOptionLabel': function(option){
            var label;
            if (option.has('label')){
                label = option.get('label');
            } else if (option.has('value')){
                label = option.get('value');
            } else {
                label = option.cid;
            }
            return label;
        },

        'selectByCid': function(cid){
            if (typeof cid !== 'string'){
                throw "i::select: incorrect cid";
            }
            var index = this.get('index'),
                isCheck = this.isCheck(),
                id;

            if (!isCheck) {
                for(id in index){
                    index[id] = id===cid ? index[id] : false;
                }
            }
            index[cid] = isCheck ? !index[cid] : true;
            this.setSelected();
        },

        'setSelected': function(){
            var index   = this.get('index'),
                type    = this.get('type'),
                isCheck = this.isCheck(),
                result  = this.get('options')
                            .filter(
                                function(option){
                                    return !!index[option.cid];
                                }
                            )
                            .map(
                                this.getOptionValue.bind(this)
                            );
            if(type==='string'){
                result = result.join(
                    this.get('delim')
                );
            } else {
                if(!isCheck){
                    result = result[0];
                }
            }
            this.set("selected", result);
        },

        'getOptionValue': function(option){
            var type = this.get('type');
            if(type==='string' || type==='array'){
                if(option.has('label')){
                    return option.get('label');
                } else if(option.has('value')){
                    return option.get('value');
                } else {
                    return option.toJSON();
                }
            } else {
                return option;
            }
        },

        'isCheckedOption': function(option){
            var index = this.get('index'),
                key = option.cid;
            return key in index ? index[key]===true : false;
        },

        'isCheck': function() {
            return this.get('mode') === 'check';
        },
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
        'focusPrev': function() {
            var current  = this.get('focus'),
                options  = this.get('options'),
                filtered = this.get('filtered'),
                prev     = false;
            if(current){
                options.every(
                    function(option){
                        if(option.cid in filtered){
                            return true;
                        }

                        if(option.cid === current){
                            this.set('focus', prev);
                            return false;
                        } else if (!option.get('disabled')){
                            prev = option.cid;
                        }

                        return true;
                    },
                    this
                );
            }
            return prev;
        },
        'focusNext': function() {
            var current  = this.get('focus'),
                options  = this.get('options'),
                filtered = this.get('filtered'),
                next     = false;
            if(current){
                options.every(
                    function(option){
                        if(option.cid in filtered){
                            return true;
                        }

                        if(next && !option.get('disabled')){
                            this.set('focus', option.cid);
                            return false;
                        } else if(option.cid === current){
                            next = true;
                        }
                        return true;
                    },
                    this
                );
            } else {
                options.every(
                    function(option){
                        if(option.cid in filtered){
                            return true;
                        } else if(!option.get('disabled')) {
                            next = option.cid;
                            return false;
                        } else {
                            return true;
                        }
                    },
                    this
                );
                this.set('focus', next);
            }
            return true;
        }
    }
);
