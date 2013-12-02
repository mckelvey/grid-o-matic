
class GridAMatic

  mainGrid: 72
  subGrid: 24
  $elements: []

  constructor: () ->
    self = @
    $('.container, .align-main, .align-sub, .golden').each () ->
      self.$elements.push($(this))
    $(window).on 'resize', { self: self }, _.debounce(self.resize, 100)
    @resize()
    @

  list: (selector, list) ->

  removeStyles: ($el, styles) ->
    re = new RegExp "(#{styles.join('|')}):[^;]+;", "gi"
    $el.attr('style', (i, style) ->
      style.replace(re) if style
      )

  applyGrid: ($el, grid) ->
    @removeStyles($el, ['margin-top', 'height'])
    offsetDifference = ($el.offset().top % grid)
    if offsetDifference isnt 0
      marginTop = parseFloat($el.css('marginTop').replace(/[^-\d]/g, ''))
      newMarginTop = if marginTop > grid then marginTop - offsetDifference else marginTop + (grid - offsetDifference)
      $el.css('marginTop', "#{newMarginTop}px")
    heightDifference = ($el.outerHeight() % grid)
    $el.height($el.height() + (grid - heightDifference)) if heightDifference isnt 0

  resize: (e) ->
    self = if e? and e.data? then e.data.self else @
    for $element in self.$elements
      if $element.hasClass('container')
        self.removeStyles($element, ['padding-top'])
        offsetDifference = ($element.offset().top % self.mainGrid)
        if offsetDifference isnt 0
          paddingTop = parseFloat($element.css('paddingTop').replace(/[^-\d]/g, ''))
          newPaddingTop = if paddingTop > self.mainGrid then paddingTop - offsetDifference else paddingTop + (self.mainGrid - offsetDifference)
          $element.css('paddingTop', "#{newPaddingTop}px")
      else
        if $element.hasClass('align-main')
          self.applyGrid($element, self.mainGrid)
        else if $element.hasClass('align-sub')
          self.applyGrid($element, self.subGrid)
        if $element.hasClass('golden')
          self.removeStyles($element, ['height'])
          $element.height($element.outerWidth() * 1.618)

$ ->
  window.gridAMatic = new GridAMatic()
