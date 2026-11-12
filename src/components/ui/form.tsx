import * as React from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { markPassthrough } from '@/lib/overlay'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

type AnyProps = Record<string, unknown>

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as React.RefObject<T | null>).current = value
}

// Local replacement for Radix `Slot`: merges its props into the single child
// element (child wins, except handlers/className/style which are combined).
function Slot({
  children,
  ref,
  ...slotProps
}: React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<unknown>
  children?: React.ReactNode
}) {
  if (!React.isValidElement<AnyProps>(children)) return null

  const childProps = children.props
  const merged: AnyProps = { ...slotProps, ...childProps }

  for (const key of Object.keys(slotProps)) {
    const slotValue = (slotProps as AnyProps)[key]
    const childValue = childProps[key]
    if (/^on[A-Z]/.test(key)) {
      if (
        typeof slotValue === 'function' &&
        typeof childValue === 'function'
      ) {
        merged[key] = (...args: unknown[]) => {
          childValue(...args)
          slotValue(...args)
        }
      }
    } else if (key === 'style') {
      merged[key] = { ...(slotValue as object), ...(childValue as object) }
    } else if (key === 'className') {
      merged[key] = cn(slotValue as string, childValue as string)
    }
  }

  const childRef = childProps.ref as React.Ref<unknown> | undefined
  if (ref || childRef) {
    merged.ref = (node: unknown) => {
      setRef(ref, node)
      setRef(childRef, node)
    }
  }

  return React.cloneElement(children, merged)
}

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formLabelId: `${id}-form-item-label`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot='form-item'
        className={cn('grid gap-2', className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { error, formItemId, formLabelId } = useFormField()

  return (
    <Label
      id={formLabelId}
      data-slot='form-label'
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  // Slot-like: props are merged into the single child element.
  const { error, formItemId, formLabelId, formDescriptionId, formMessageId } =
    useFormField()

  return (
    <Slot
      data-slot='form-control'
      id={formItemId}
      aria-labelledby={formLabelId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

// FormControl only forwards props to its child (usually a Hero Button), so an
// overlay trigger can hand its press/focus props straight through it.
markPassthrough(FormControl)

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot='form-description'
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? '') : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot='form-message'
      id={formMessageId}
      className={cn('text-sm text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
