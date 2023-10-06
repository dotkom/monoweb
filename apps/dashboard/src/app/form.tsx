import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  type CheckboxProps,
  Flex,
  Select,
  type SelectProps,
  TextInput,
  type TextInputProps,
  Textarea,
  type TextareaProps,
} from "@mantine/core";
import { DateTimePicker, type DateTimePickerProps } from "@mantine/dates";
import { type FC } from "react";
import {
  type Control,
  Controller,
  type DefaultValues,
  type FieldValue,
  type FieldValues,
  type FormState,
  type UseFormRegister,
  useForm,
} from "react-hook-form";
import { type z } from "zod";

interface InputFieldContext<T extends FieldValues> {
  control: Control<T>;
  name: FieldValue<T>;
  register: UseFormRegister<T>;
  state: FormState<T>;
}
type InputProducerResult<F extends FieldValues> = FC<InputFieldContext<F>>;

export function createSelectInput<F extends FieldValues>({
  ...props
}: Omit<SelectProps, "error">): InputProducerResult<F> {
  return function FormSelectInput({ control, name, state }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            {...props}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    );
  };
}

export function createDateTimeInput<F extends FieldValues>({
  ...props
}: Omit<DateTimePickerProps, "error">): InputProducerResult<F> {
  return function FormDateTimeInput({ control, name, state }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DateTimePicker
            {...props}
            defaultValue={new Date()}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    );
  };
}

export function createCheckboxInput<F extends FieldValues>({
  ...props
}: Omit<CheckboxProps, "error">): InputProducerResult<F> {
  return function FormCheckboxInput({ name, register, state }) {
    return (
      <Checkbox
        {...register(name)}
        {...props}
        error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
      />
    );
  };
}

export function createTextareaInput<F extends FieldValues>({
  ...props
}: Omit<TextareaProps, "error">): InputProducerResult<F> {
  return function TextareaInput({ name, register, state }) {
    return (
      <Textarea
        {...register(name)}
        {...props}
        error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
      />
    );
  };
}

export function createTextInput<F extends FieldValues>({
  ...props
}: Omit<TextInputProps, "error">): InputProducerResult<F> {
  return function FormTextInput({ name, register, state }) {
    return (
      <TextInput
        {...register(name)}
        {...props}
        error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
      />
    );
  };
}

function entriesOf<T extends Record<string, unknown>, K extends keyof T & string>(obj: T): Array<[K, T[K]]> {
  return Object.entries(obj) as Array<[K, T[K]]>;
}

interface FormBuilderOptions<T extends z.ZodRawShape> {
  defaultValues?: DefaultValues<z.infer<z.ZodObject<T>>>;
  fields: Partial<{
    [K in keyof z.infer<z.ZodObject<T>>]: InputProducerResult<z.infer<z.ZodObject<T>>>;
  }>;
  label: string;
  onSubmit(data: z.infer<z.ZodObject<T>>): void;
  schema: z.ZodObject<T>;
}

export function useFormBuilder<T extends z.ZodRawShape>({
  defaultValues,
  fields,
  label,
  onSubmit,
  schema,
}: FormBuilderOptions<T>): FC {
  const form = useForm<z.infer<z.ZodObject<T>>>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const components = entriesOf(fields).map(([name, fc]) => {
    if (!fc) {
      throw new Error();
    }

    const Component: InputProducerResult<z.infer<z.ZodObject<T>>> = fc;

    return <Component control={form.control} key={name} name={name} register={form.register} state={form.formState} />;
  });

  return function Form() {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Flex direction="column" gap="md">
          {components}

          <div>
            <Button type="submit">{label}</Button>
          </div>
        </Flex>
      </form>
    );
  };
}
