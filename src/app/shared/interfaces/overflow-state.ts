export interface OverflowState {
    hasOverflow: boolean;
    atStart: boolean;
    atEnd: boolean;
    atMiddle: boolean;
    scrollLeft: number;
    scrollWidth: number;
    clientWidth: number;
    scrollableWidth: number;
    visibleStart: number;
    visibleEnd: number;
    percentage: number;
}