
'use strict'
### jslint browser: true ###
### global $, _ ###

class GridOMatic

  mainGrid: 72
  subGrid: 24
  $elements: []

  constructor: () ->
    self = @
    $('.container, [data-align], [data-ratio]').each () ->
      self.$elements.push($(this))
    $(window).on 'resize', { self: self }, _.debounce(self.resize, 100)
    @resize()
    @

  removeStyles: ($el, styles) ->
    re = new RegExp "(#{styles.join('|')}):[^;]+;", "gi"
    $el.attr('style', (i, style) ->
      style.replace(re) if style
      )

  setTop: ($el, grid, method) ->
    offsetDifference = ($el.offset().top % grid)
    if offsetDifference isnt 0
      top = parseFloat($el.css("#{method}Top").replace(/[^-\d]/g, ''))
      newTop = if top > grid then top - offsetDifference else top + (grid - offsetDifference)
      $el.css("#{method}Top", "#{newTop}px")
      
  snapToGrid: ($el, grid, method='margin') ->
    @removeStyles($el, ["#{method}-top", 'height'])
    @setTop($el, grid, method)
    heightDifference = ($el.outerHeight() % grid)
    $el.height($el.height() + (grid - heightDifference)) if heightDifference isnt 0

  resize: (e) ->
    self = if e? and e.data? then e.data.self else @
    for $element in self.$elements
      alignment = $element.attr('data-align')
      ratio = $element.attr('data-ratio')
      if $element.hasClass('container') and alignment isnt ''
        self.removeStyles($element, ['padding-top'])
        self.setTop($element, (if alignment is 'sub' then self.subGrid else self.mainGrid), 'padding')
      else
        if alignment is 'main'
          self.snapToGrid($element, self.mainGrid)
        else if alignment is 'sub'
          self.snapToGrid($element, self.subGrid)
        if ratio isnt undefined and ratio isnt ''
          $element.addClass('contained') if $element.hasClass('not-contained') isnt true
          factor = switch ratio
            when 'golden', 'golden-vertical', 'golden vertical' then 1.618
            when 'golden-horizontal', 'golden horizontal' then 0.618
            when 'square' then 1
            else null
          if factor?
            self.removeStyles($element, ['height'])
            $element.height($element.outerWidth() * factor)

$ ->
  window.gridOMatic = new GridOMatic()
