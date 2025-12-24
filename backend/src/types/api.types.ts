import { EmpireData } from "./config.types";

export interface OddsRequest extends EmpireData {}
  
export interface OddsResponse {
    success: boolean;
    odds: number;
}