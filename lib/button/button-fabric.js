import ns from '../ns.js';
import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';


ns.button = function(data){
    var button;
    
    if (typeof data === 'string'){
        button = new ns.models.button({'label':data})
    } else

    if (data instanceof Backbone.Model){
        button = data;
    } else

    if (Object.prototype.toString.call(data) === '[object Object]'){
        button = new ns.models.button(data);
    }

    return button;
}
