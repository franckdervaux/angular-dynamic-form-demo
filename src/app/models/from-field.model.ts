// models/form-field.model.ts
export interface FormFieldOption {
    label: string
    value: string
}

export interface FormFieldVisibility {
    fieldName: string
    operator: 'in' | 'notIn'
    values: string[]
}

export interface FormField {
    name: string
    label: string
    type: 'text' | 'select' | 'checkbox'
    options?: FormFieldOption[]
    visibility?: FormFieldVisibility
    defaultValue?: any
}
