import ns from '../ns.js';
import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';


ns.views.suggest = Backbone.View.extend(
    {
        'initialize': function (argument) {
            this.listenTo(
                this.model,
                'change:select',
                this.setSelect
            );
            this.listenTo(
                this.model,
                'change:loading',
                this.setLoading
            );
            this.setSelect();
        },
        'setLoading': function(){
            this.$el.toggleClass(
                'i-suggest__loading',
                this.model.get('loading')
            );
        },
        'setSelect': function(){
            var select = this.model.get('select');
            select.on(
                'change:input',
                this.setInput,
                this
            );
            select.on(
                'change:checked',
                function() {
                    select.set(
                        'checked',
                        false
                    );
                }
            );
            this.setInput(
                select,
                select.get('input')
            );
        },
        'setInput': function(select, input){
            var $input  = this.$el.find('.i-input__input'),
                $button = this.$el.find('.i-button');

            if(input){
                if( $input.length === 0 ){
                    setTimeout(
                        function(self){
                            self.setInput(select, input)
                        },
                        0,
                        this
                    );
                } else {
                    $input.on({
                        'click':     this.stop,
                        'mousedown': this.stop,
                        'mouseup':   this.stop,
                        'focus':     this.focus.bind(this, true),
                        'blur':      this.focus.bind(this, false),
                        'keyup':     this.keyup.bind(this),
                        'keydown':   this.keydown.bind(this),
                    });

                    $button.attr({'tabindex': -1});
                    $input .attr({'tabindex':  0});
                    $input .attr({'autocomplete':  'off'});
                }
            } else {
                $button.attr({'tabindex': 0});
                $button.focus();
            }
        },

        'focus': function(focus, e){
            this.stop(e);
            this.$el
                .find('.i-button')
                .toggleClass('i-button__pseudofocus', focus);
        },

        'stop': function(e){
            e.stopPropagation();
        },

        'keydown': function(e){
            switch (e.which) {
                case ns.keys.space:
                    e.stopPropagation();
                    break;
            }
        },

        'keyup': function(e){
            switch (e.which) {
                case ns.keys.backspace:
                    this.model.get('mode') === 'check' &&
                    this.uncheckLast();
                    break;
                case ns.keys.space:
                    e.preventDefault();
                    e.stopPropagation();
                    break;
            }
        },

        'uncheckLast': function(e) {
            var select = this.model.get('select'),
                input = select.get('input'),
                options = select.get('selected');
            input.get('value') ||
                options.length &&
                select.select(options[options.length - 1]);
        }
    }
);
