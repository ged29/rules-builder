import { Component, OnInit } from '@angular/core';
import { IDroppableToolboxItem } from '../../../common-interfaces';
import nodesRegistry from "../../../nodes-registry";

@Component({
  selector: 'nodes-toolbox',
  templateUrl: './nodes-toolbox.component.html',
  styleUrls: ['./nodes-toolbox.component.less']
})
export class NodesToolboxComponent implements OnInit {
  toolboxGroups: IDroppableToolboxItem[];

  constructor() {    
    this.toolboxGroups = nodesRegistry.getToolboxGroups();
  }

  ngOnInit() {
  }

}
