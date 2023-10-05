import { type z } from "zod";
import { render } from "@react-email/render";
import { type FC } from "react";

export class InvalidTemplateArguments extends Error {}

export interface Template<T extends Record<string, unknown>> {
    (args: z.infer<z.ZodSchema<T>>): string;
    displayName: string;
}

export function createTemplate<T extends Record<string, unknown>>(
    name: string,
    schema: z.ZodSchema<T>,
    Component: FC<z.infer<typeof schema>>
): Template<T> {
    const handler = (args: z.infer<typeof schema>) => {
        const result = schema.safeParse(args);

        if (!result.success) {
            throw new InvalidTemplateArguments(`Invalid arguments passed to email template: ${result.error.message}`);
        }

        return render(<Component {...args} />);
    };

    handler.displayName = name;

    return handler;
}

export type TemplateProps<S extends z.ZodSchema> = z.infer<S>;
