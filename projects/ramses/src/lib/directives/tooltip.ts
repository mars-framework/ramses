import { Directive, ElementRef, HostListener, inject, input, OnDestroy } from '@angular/core';
import { Overlay, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Tooltip as Bubble } from '../components/tooltip/tooltip';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

@Directive({
  selector: '[mTooltip]',
})
export class Tooltip implements OnDestroy {
  private readonly overlay: Overlay = inject(Overlay);
  private readonly elementRef: ElementRef = inject(ElementRef<HTMLElement>);

  mTooltip = input.required<string>();
  mTooltipPosition = input<TooltipPosition>('auto');

  private overlayRef: OverlayRef | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly allPositions: ConnectedPosition[] = [
    // top
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -8,
    },
    // bottom
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: 8,
    },
    // right
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: 8,
    },
    // left
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -8,
    },
  ];

  @HostListener('mouseenter')
  @HostListener('focus')
  show(): void {
    if (this.overlayRef?.hasAttached()) return;

    this.attachTooltip();
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  hide(): void {
    this.clearHideTimeout();

    if (!this.overlayRef?.hasAttached()) return;

    this.detachTooltip();
  }

  private attachTooltip(): void {
    if (this.overlayRef?.hasAttached()) return;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(this.getPositions())
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const portal = new ComponentPortal(Bubble);
    const componentRef = this.overlayRef.attach(portal);
    componentRef.setInput('message', this.mTooltip());
  }

  private detachTooltip(): void {
    const overlayElement: HTMLElement = this.overlayRef?.overlayElement ?? new HTMLElement();
    //this.overlayRef?.addPanelClass('close-tooltip');
    //overlayElement.classList.remove('visible');
    overlayElement.classList.add('close-tooltip');
    this.hideTimeout = setTimeout(() => this.overlayRef?.detach(), 150);
  }

  private getPositions(): ConnectedPosition[] {
    const pos = this.mTooltipPosition();

    if (pos === 'auto') {
      return this.allPositions;
    }

    const map: Record<Exclude<TooltipPosition, 'auto'>, ConnectedPosition> = {
      top: this.allPositions[0],
      bottom: this.allPositions[1],
      right: this.allPositions[2],
      left: this.allPositions[3],
    };

    // On force la direction demandée
    return [map[pos]];
  }

  private clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  ngOnDestroy(): void {
    this.clearHideTimeout();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
