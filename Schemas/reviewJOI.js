const BaseJoi =require('joi');
const sanitizeHTML=require("sanitize-html");
const extension=(joi)=> ({
    type:'string',
    base:joi.string(),
    messages:{
        'string.escapeHTML':'{{#label}} must not include HTML'
    },
    rules:{
        escapeHTML:{
            validate(value,helpers){
              const clean=sanitizeHTML(value,{
                allowedTags:[],
                allowedAttributes:{},
              });
              if(clean!=value)
              return helpers.error('string.escapeHTML',{value})
              return clean;
            }
        }
    }
                 
});

const Joi = BaseJoi.extend(extension);

module.exports.reviewSchema = Joi.object({
    body:Joi.string().required().escapeHTML(),
    rating:Joi.number().min(1).max(5).required(),
})