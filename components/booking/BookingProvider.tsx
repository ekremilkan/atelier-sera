"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import {
  ANY_STYLIST,
  type Booking,
  type Category,
  type CustomerDetails,
  type ISODate,
  type Minutes,
  type SalonConfig,
  type Service,
  type Stylist,
  type StylistChoice,
} from "@/lib/booking/types";

export interface Catalog {
  salon: SalonConfig;
  categories: Category[];
  services: Service[];
  stylists: Stylist[];
}

export type Step = 0 | 1 | 2 | 3 | 4;

export interface BookingState {
  open: boolean;
  step: Step;
  serviceIds: string[];
  stylist: StylistChoice | null;
  date: ISODate | null;
  start: Minutes | null;
  details: CustomerDetails;
  booking: Booking | null;
  /** Transient notice, e.g. when a pre-selected stylist had to be dropped. */
  notice: { key: "switched"; name: string } | null;
}

export interface OpenOptions {
  serviceIds?: string[];
  stylistId?: string;
}

type Action =
  | { type: "open"; opts: OpenOptions; catalog: Catalog }
  | { type: "close" }
  | { type: "goto"; step: Step }
  | { type: "toggleService"; id: string; catalog: Catalog }
  | { type: "stylist"; value: StylistChoice }
  | { type: "date"; value: ISODate }
  | { type: "time"; value: Minutes | null }
  | { type: "details"; value: Partial<CustomerDetails> }
  | { type: "confirmed"; booking: Booking };

const emptyDetails: CustomerDetails = { name: "", email: "", phone: "", note: "", consent: false };

const initial: BookingState = {
  open: false,
  step: 0,
  serviceIds: [],
  stylist: null,
  date: null,
  start: null,
  details: emptyDetails,
  booking: null,
  notice: null,
};

const offers = (catalog: Catalog, stylistId: string, serviceId: string) =>
  catalog.stylists.find((s) => s.id === stylistId)?.serviceIds.includes(serviceId) ?? false;

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "open": {
      // A finished booking starts fresh; otherwise keep the basket (users browse, then come back).
      const base = state.booking ? { ...initial, details: state.details } : state;
      let serviceIds = [...new Set([...base.serviceIds, ...(action.opts.serviceIds ?? [])])];
      let stylist = base.stylist;
      if (action.opts.stylistId) {
        stylist = action.opts.stylistId;
        serviceIds = serviceIds.filter((id) => offers(action.catalog, action.opts.stylistId!, id));
      } else if (stylist && stylist !== ANY_STYLIST && serviceIds.some((id) => !offers(action.catalog, stylist!, id))) {
        stylist = ANY_STYLIST;
      }
      const changed = serviceIds.join() !== base.serviceIds.join() || stylist !== base.stylist;
      return {
        ...base,
        open: true,
        step: 0,
        serviceIds,
        stylist,
        start: changed ? null : base.start,
        notice: null,
      };
    }
    case "close":
      return { ...state, open: false, notice: null };
    case "goto":
      return { ...state, step: action.step, notice: null };
    case "toggleService": {
      const has = state.serviceIds.includes(action.id);
      const serviceIds = has ? state.serviceIds.filter((s) => s !== action.id) : [...state.serviceIds, action.id];
      let { stylist } = state;
      let notice: BookingState["notice"] = null;
      if (!has && stylist && stylist !== ANY_STYLIST && !offers(action.catalog, stylist, action.id)) {
        const name = action.catalog.stylists.find((s) => s.id === stylist)?.name.split(" ")[0] ?? "";
        notice = { key: "switched", name };
        stylist = ANY_STYLIST;
      }
      return { ...state, serviceIds, stylist, start: null, notice };
    }
    case "stylist":
      return { ...state, stylist: action.value, start: state.stylist === action.value ? state.start : null };
    case "date":
      return { ...state, date: action.value, start: state.date === action.value ? state.start : null };
    case "time":
      return { ...state, start: action.value };
    case "details":
      return { ...state, details: { ...state.details, ...action.value } };
    case "confirmed":
      return { ...state, booking: action.booking, step: 4 };
  }
}

interface Ctx {
  state: BookingState;
  catalog: Catalog;
  open: (opts?: OpenOptions) => void;
  close: () => void;
  goto: (step: Step) => void;
  toggleService: (id: string) => void;
  setStylist: (v: StylistChoice) => void;
  setDate: (v: ISODate) => void;
  setTime: (v: Minutes | null) => void;
  setDetails: (v: Partial<CustomerDetails>) => void;
  confirmed: (b: Booking) => void;
}

const BookingContext = createContext<Ctx | null>(null);

export function BookingProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const open = useCallback((opts: OpenOptions = {}) => dispatch({ type: "open", opts, catalog }), [catalog]);
  const close = useCallback(() => dispatch({ type: "close" }), []);
  const goto = useCallback((step: Step) => dispatch({ type: "goto", step }), []);
  const toggleService = useCallback((id: string) => dispatch({ type: "toggleService", id, catalog }), [catalog]);
  const setStylist = useCallback((value: StylistChoice) => dispatch({ type: "stylist", value }), []);
  const setDate = useCallback((value: ISODate) => dispatch({ type: "date", value }), []);
  const setTime = useCallback((value: Minutes | null) => dispatch({ type: "time", value }), []);
  const setDetails = useCallback((value: Partial<CustomerDetails>) => dispatch({ type: "details", value }), []);
  const confirmed = useCallback((booking: Booking) => dispatch({ type: "confirmed", booking }), []);

  const value = useMemo(
    () => ({ state, catalog, open, close, goto, toggleService, setStylist, setDate, setTime, setDetails, confirmed }),
    [state, catalog, open, close, goto, toggleService, setStylist, setDate, setTime, setDetails, confirmed],
  );
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
