// models/form-field.model.ts
export type FormFieldOption = {
    label: string
    value: string
}


export type FormField = {
    name: string
    label: string
    type: 'text' | 'select' | 'checkbox'
    options?: FormFieldOption[]
    visibility?: Condition
    defaultValue?: any
}

export type SimpleCondition = {
    fieldName: string
    operator: 'in' | 'notIn'
    values: string[]
}

export type BooleanCondition = {
    fieldName: string
    operator: 'true' | 'false'
}

export type NestedCondition = {
    operator: 'and' | 'or'
    conditions: Condition[]
}

export type Condition = SimpleCondition | BooleanCondition | NestedCondition