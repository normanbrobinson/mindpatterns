/**
* Copyright 2015 eBay Inc.
*
* Use of this source code is governed by a MIT-style
* license that can be found in the LICENSE file or at
* https://opensource.org/licenses/MIT.
*/

/**
* @function jquery.combobox.js
* @desc Please DO NOT copy this code to production! This is 'quick & ugly, just make it work!' code.
* @author Ian McBurnie <imcburnie@ebay.com>
* @requires @ebay/jquery-next-id
* @requires @ebay/jquery-common-keydown
* @requires @ebay/jquery-active-descendant
* @requires @ebay/jquery-click-flyout
*/
(function ( $ ) {
    var data = ['Playstation 3', 'Playstation 4', 'Xbox 360', 'Xbox One', 'Wii', 'Wii U'];

    $.fn.combobox = function combobox(options) {
        options = options || {};

        return this.each(function onEachCombobox() {
            var $widget = $(this),
                $input = $widget.find('> input'),
                $button = $('<button>'),
                $flyoutEl = $('<div>'),
                $listbox = $('<ul>'),
                $statusEl = $('<span aria-live="assertive" aria-atomic="true">Option: <span></span></span>'),
                $instructionsEl = $('<span>'),
                $statusMsg,
                blurTimer;

            $widget.nextId('combobox');

            $widget
                .attr('role', 'application')
                .addClass('flyout');

            $flyoutEl.addClass('flyout__overlay');

            $listbox
                .prop('id', $widget.prop('id') + '-listbox')
                .css('width', $input.css('width'))
                .attr('role', 'listbox');

            $instructionsEl
                .addClass('combobox__description')
                .prop('id', $widget.prop('id') + '-instructions')
                .text('Combo box list has 6 options. Use arrow keys to navigate options and ENTER to select.');

            $statusEl
                .addClass('combobox__status')
                .prop('id', $widget.prop('id') + '-status');

            $input
                .attr('role', 'combobox')
                .attr('autocomplete','off') // Disable HTML5 autocomplete
                .attr('aria-describedby', $instructionsEl.prop('id'))
                .addClass('flyout__trigger');

            $button
                .attr('type', 'button')
                .attr('tabindex', '-1')
                .attr('aria-label', 'Expand suggestions')
                .addClass('button');

            data.forEach(function(item, idx) {
                $listbox.append('<li role="option">'+item+'</li>');
            });

            // DOM manipulation
            $widget.append($button);
            $widget.append($instructionsEl);
            $flyoutEl.append($listbox);
            $flyoutEl.append($statusEl);
            $widget.append($flyoutEl);

            $statusMsg = $statusEl.children().first();

            // plugins
            $widget.commonKeyDown();
            $widget.activeDescendant($input, '[role=listbox]', '[role=option]', {axis: 'y'});
            $widget.focusFlyout({autoExpand: options.autoExpand});

            var isExpanded = function() {
                return $input.attr('aria-expanded') === 'true';
            };

            var expandCombobox = function() {
                clearTimeout(blurTimer);
                $input.attr('aria-expanded', 'true');
                $widget.trigger('comboboxExpand');
            };

            var collapseCombobox = function() {
                $input.attr('aria-expanded', 'false');
                $widget.trigger('comboboxCollapse');
            };

            var toggleCombobox = function() {
                var _void = isExpanded() ? collapseCombobox() : expandCombobox();
            };

            var onComboboxEscape = function(e) {
                var _void = isExpanded() ? collapseCombobox() : $input.val('');
            };

            var onActiveDescendantChange = function(e, data) {
                $statusMsg.text($listbox.find('[role=option]').get(data.toIndex).innerText);
            };

            var onListboxClick = function(e) {
                $input.val($(this).text());
                var _void = toggleCombobox();
            };

            var onComboboxUpArrow = function(e) {
                // prevent caret from moving to start
                e.preventDefault();
                expandCombobox();
            };

            var onComboboxDownArrow = function(e) {
                expandCombobox();
            };

            var onComboboxEnterKey = function(e) {
                // if combobox is expanded
                if (isExpanded()) {
                    // update combobox value
                    $input.val($listbox.find('.active-descendant').text());
                    // prevent form submission
                    e.preventDefault();
                    collapseCombobox();
                }
            };

            var onButtonClick = function(e) {
                toggleCombobox();
            };

            // listen for events
            $widget.on('downArrowKeyDown', '[role=combobox]', onComboboxDownArrow);
            $widget.on('upArrowKeyDown', '[role=combobox]', onComboboxUpArrow);
            $widget.on('enterKeyDown', '[role=combobox]', onComboboxEnterKey);
            $widget.on('activeDescendantChange', '[role=option]', onActiveDescendantChange);
            $widget.on('escapeKeyDown', '[role=combobox]', onComboboxEscape);
            $button.on('click', onButtonClick);
            $listbox.on('click', '[role=option]', onListboxClick);
        });
    };
}( jQuery ));
