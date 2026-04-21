export type DocumentType = 'CC' | 'CE' | 'NIT' | 'PASSPORT' | 'OTHER';
export type CustomerType = 'PERSONA_NATURAL' | 'EMPRESA';

export interface Customer {
  id: string;
  fullName: string;
  document: string;
  documentType: DocumentType;
  address?: string;
  city?: string;
  email?: string;
  businessName?: string;
  phone?: string;
  customerType: CustomerType;
  registrationDay: string;
  active: boolean;
}

export interface CustomerRequest {
  fullName: string;
  document: string;
  documentType: DocumentType;
  address?: string;
  city?: string;
  email?: string;
  businessName?: string;
  phone?: string;
  customerType: CustomerType;
  active: boolean;
}
