import {
    event as d3_event,
    select as d3_select
} from 'd3-selection';


import { t, textDirection } from '../util/locale';
import { svgIcon } from '../svg';
import { uiDisclosure } from './disclosure';
import { uiMapInMap } from './map_in_map';
import { uiTooltipHtml } from './tooltipHtml';
import { tooltip } from '../util/tooltip';


export function uiBackgroundDisplayOptions(context) {
    var _selection = d3_select(null);
    var sliders = ['brightness', 'contrast', 'saturation', 'sharpness'];

    var _options = {
        brightness: (context.storage('background-opacity') !== null) ?
            (+context.storage('background-opacity')) : 1.0,
        contrast: 1,
        saturation: 1,
        sharpness: 1
    };


    function clamp(x, min, max) {
        return Math.max(min, Math.min(x, max));
    }


    function updateValue(d, val) {
        if (!val && d3_event && d3_event.target) {
            val = d3_event.target.value;
        }

        val = clamp(val, 0.25, 2);

        _options[d] = val;
        context.background()[d](val);

        if (d === 'brightness') {
            context.storage('background-opacity', val);
        }

        _selection
            .call(render);
    }


    function render(selection) {
        var container = selection.selectAll('.display-options-container')
            .data([0]);

        var containerEnter = container.enter()
            .append('div')
            .attr('class', 'display-options-container controls-list');

        // add slider controls
        var slidersEnter = containerEnter.selectAll('.display-control')
            .data(sliders)
            .enter()
            .append('div')
            .attr('class', function(d) { return 'display-control display-control-' + d; });

        slidersEnter
            .append('h5')
            .text(function(d) { return t('background.' + d); })
            .append('span')
            .attr('class', function(d) { return 'display-option-value display-option-value-' + d; });

        slidersEnter
            .append('input')
            .attr('class', function(d) { return 'display-option-input display-option-input-' + d; })
            .attr('type', 'range')
            .attr('min', '0.25')
            .attr('max', '2')
            .attr('step', '0.05')
            .on('input', function(d) {
                var val = d3_select(this).property('value');
                updateValue(d, val);
            });

        slidersEnter
            .append('button')
            .attr('title', t('background.reset'))
            .attr('class', function(d) { return 'display-option-reset display-option-reset-' + d; })
            .on('click', function(d) {
                if (d3_event.button !== 0) return;
                updateValue(d, 1);
            })
            .call(svgIcon('#icon-' + (textDirection === 'rtl' ? 'redo' : 'undo')));


        // add minimap toggle
        var minimapEnter = containerEnter
            .append('div')
            .attr('class', 'minimap-toggle-wrap');

        var minimapLabelEnter = minimapEnter
            .append('label')
            .call(tooltip()
                .html(true)
                .title(uiTooltipHtml(t('background.minimap.tooltip'), t('background.minimap.key')))
                .placement('top')
            );

        minimapLabelEnter
            .classed('minimap-toggle', true)
            .append('input')
            .attr('type', 'checkbox')
            .on('change', function() {
                uiMapInMap.toggle();
                d3_event.preventDefault();
            });

        minimapLabelEnter
            .append('span')
            .text(t('background.minimap.description'));


        // update
        container = containerEnter
            .merge(container);

        container.selectAll('.display-option-input')
            .property('value', function(d) { return _options[d]; });

        container.selectAll('.display-option-value')
            .text(function(d) { return Math.floor(_options[d] * 100) + '%'; });

        container.selectAll('.display-option-reset')
            .classed('disabled', function(d) { return _options[d] === 1; });
    }


    function backgroundDisplayOptions(selection) {
        _selection = selection;

        selection
            .call(uiDisclosure(context, 'background_display_options', true)
                .title(t('background.display_options'))
                .content(render)
            );
    }

    // setDisplayOption('brightness', _options.brightness);


    return backgroundDisplayOptions;
}
