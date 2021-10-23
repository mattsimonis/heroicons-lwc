import { LightningElement, api } from 'lwc';
import { default as IconLib } from './templates';

import standardTemplate from './heroicons.html';

export default class Heroicons extends LightningElement {
  @api src;
  @api iconName;
  @api svgClass;

  render() {
    if (this.iconName) {
      return IconLib[this.iconName];
    }
    return standardTemplate;
  }

  get computedClass() {
    return this.svgClass
  }

  get href() {
    return this.src || '';
  }
}
