// models/form-field.model.ts
export type FormFieldOption = {
    label: string
    value: string
}


export type FormField = {
    name: string
    label: string
    type: 'text' | 'select' | 'checkbox' | 'image'
    options?: FormFieldOption[]
    image?: ImageDefinition
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

export type NotCondition = {
    operator: 'not'
    condition: Condition
}

export type Condition = SimpleCondition | BooleanCondition | NestedCondition | NotCondition

export type ImageDefinition = {
    fieldName: string
    defaultImage: string
    valueMap: { [key: string]: string }
}

export type TemplateDefinition = {
    name: string,
    for: "Reception" | "UM" | "Non Conformité" | "Urgence",
    method: "create" | "update",
    updated: string, // must be a valid ISO 8601 date time string
    fields: FormField[]
}