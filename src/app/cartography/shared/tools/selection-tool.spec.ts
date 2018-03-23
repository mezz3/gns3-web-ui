import { select } from "d3-selection";

import { SelectionTool } from "./selection-tool";
import { Context } from "../../../map/models/context";
import { SVGSelection } from "../../../map/models/types";
import { Rectangle } from "../models/rectangle";


describe('SelectionTool', () => {
  let tool: SelectionTool;
  let svg: SVGSelection;
  let context: Context;
  let selection_line_tool: SVGSelection;
  let path_selection: SVGSelection;
  let selected_rectangle: Rectangle;

  beforeEach(() => {
    tool = new SelectionTool();

    tool.rectangleSelected.subscribe((rectangle: Rectangle) => {
      selected_rectangle = rectangle;
    });

    svg = select('body')
        .append<SVGSVGElement>('svg')
        .attr('width', 1000)
        .attr('height', 1000);

    svg.append<SVGGElement>('g').attr('class', 'canvas');

    context = new Context();

    tool.connect(svg, context);
    tool.draw(svg, context);
    tool.activate();

    selection_line_tool = svg.select('g.selection-line-tool');
    path_selection = selection_line_tool.select('path.selection');
  });

  it('creates selection-line-tool container with path', () => {
    expect(selection_line_tool.node()).not.toBeNull();
    expect(selection_line_tool.select('path')).not.toBeNull();
    expect(path_selection.attr('visibility')).toEqual('hidden');
  });

  describe('SelectionTool can handle start of selection', () => {
    beforeEach(() => {
      svg.node().dispatchEvent(new MouseEvent('mousedown', {clientX: 100, clientY: 100}));
    });

    it('path should be visible and have parameters', () => {
        expect(path_selection.attr('visibility')).toEqual('visible');
        expect(path_selection.attr('d')).toEqual('M95,86 l0,0 l0,0 l0,0z');
    });
  });

  describe('SelectionTool can handle move of selection', () => {
    beforeEach(() => {
      svg.node().dispatchEvent(new MouseEvent('mousedown', {clientX: 100, clientY: 100}));
      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 300, clientY: 300}));
    });

    it('path should have got changed parameters', () => {
        expect(path_selection.attr('d')).toEqual('M95,86 l200,0 l0,200 l-200,0z');
    });
  });

  describe('SelectionTool can handle end of selection', () => {
    beforeEach(() => {
      svg.node().dispatchEvent(new MouseEvent('mousedown', {clientX: 100, clientY: 100}));
      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 200, clientY: 200}));
      window.dispatchEvent(new MouseEvent('mouseup', {clientX: 200, clientY: 200}));
    });

    it('path should be hidden', () => {
      expect(path_selection.attr('visibility')).toEqual('hidden');
    });

    it('rectangle should be selected', () => {
      expect(selected_rectangle).toEqual(new Rectangle(95, 86, 100, 100));
    });

    describe('SelectionTool can deselect after click outside', () => {
      beforeEach(() => {
        svg.node().dispatchEvent(new MouseEvent('mousedown', {clientX: 300, clientY: 300}));
        window.dispatchEvent(new MouseEvent('mouseup', {clientX: 300, clientY: 300}));
      });

      it('rectangle should be selected', () => {
        expect(selected_rectangle).toEqual(new Rectangle(295, 286, 0, 0));
      });
    });
  });

  describe('SelectionTool can handle end of selection in reverse direction', () => {
    beforeEach(() => {
      svg.node().dispatchEvent(new MouseEvent('mousedown', {clientX: 200, clientY: 200}));
      window.dispatchEvent(new MouseEvent('mousemove', {clientX: 100, clientY: 100}));
      window.dispatchEvent(new MouseEvent('mouseup', {clientX: 100, clientY: 100}));
    });

    it('rectangle should be selected', () => {
      expect(selected_rectangle).toEqual(new Rectangle(95, 86, 100, 100));
    });
  });

  describe('SelectionTool can be deactivated', () => {
    beforeEach(() => {
      tool.deactivate();
      svg.node().dispatchEvent(new MouseEvent('mousedown', {clientX: 100, clientY: 100}));
    });

    it('path should be still hiden', () => {
        expect(path_selection.attr('visibility')).toEqual('hidden');
    });
  });


});
