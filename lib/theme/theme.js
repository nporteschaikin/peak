var Theme = function Theme () {
  this.elements();
  this.events();
}

Theme.prototype = {

  elements: function () {
    this.el = {
      button: document.querySelector('#header button'),
      code: document.querySelector('main')
    }
  },

  events: function () {
    this.el.button
      .addEventListener("click", this.select.bind(this));
  },

  select: function (e) {

    if (e) e.preventDefault();

    var range = document.createRange()
      , selection;

    range.selectNodeContents(this.el.code);
    selection = window.getSelection();

    selection
      .removeAllRanges();

    selection
      .addRange(range);

  }

}

window.onload = function () {
  return new Theme();
}
