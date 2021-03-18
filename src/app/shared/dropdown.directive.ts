import { Directive, HostListener, HostBinding } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  @HostBinding('class.open') isOpen = false;
  //DOM Property 'class.open' is bind to data property isOpen
  @HostListener('click') toggleOpen() { //Similarly, DOM property 'click' is bind to data property (i.e function toggleOpen)
    this.isOpen = !this.isOpen;
  }
}
