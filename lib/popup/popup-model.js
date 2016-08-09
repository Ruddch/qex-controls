import ns from '../ns.js';
import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';


ns.models.popup = Backbone.Model.extend(
    {   
        'initialize': function() {
            if (this.get('ownerButton')) {
                this.set('owner', this.get('ownerButton').view.el);
                this.set('mode', 'button');
            }
            this.get('adaptive') === true &&
                this.set(
                    'adaptive',
                    'bottom left top right'
                );
            this.on(
                'change:side',
                this.getDimensions
            );
        },
        'getDimensions': function() {
            var side = this.get('side'),
                hor = side === 'left' || side === 'right',
                opposites = {
                    'top': 'bottom',
                    'bottom': 'top',
                    'left': 'right',
                    'right': 'left'
                };
            this.set({
                'sideDim'   : hor ? 'width'  : 'height',
                'alignDim'  : hor ? 'height' : 'width',
                'sideStart' : hor ? 'left'   : 'top',
                'alignStart': hor ? 'top'    : 'left',
                'opposite': opposites[side]
            });
            this.set(
                'sideEnd',
                opposites[this.get('sideStart')]
            );
            this.set(
                'alignEnd',
                opposites[this.get('alignStart')]
            );
        },
        'defaults': {
            'owner': document.body,
            'side': 'bottom',
            'adaptive': false,
            'align': 'start',
            'sideOffset': 6,
            'alignOffset': 1,
            'tail': false,
            'tailWidth': 12,
            'tailHeight': 6,
            'tailAlign': 'center',
            'tailOffset': 0,
            'autoclose': true,
            'delay': 500,
            'disabled': false,
            'className': ''
        }
    }
);
