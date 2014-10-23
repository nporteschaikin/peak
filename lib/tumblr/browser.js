var cheerio = require('cheerio');

var Browser = function (html) {
  this.$ = cheerio.load(html);
}

Browser.prototype = {

  value_of_element_with_id: function (id) {
    return this.$('#' + id).val();
  },

  values_in_form_with_id: function (id) {
    var form = this.form_with_id(id)
      , values = {}
      , key;

    form.find('input, textarea, select, keygen').each(function(){
      key = this.attr('name');
      values[key] = this.val();
    });

    return values;
  },

  form_with_id: function (id) {
    return this.$('form#' + id);
  }

}

module.exports = Browser;
