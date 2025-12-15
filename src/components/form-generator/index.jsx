"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ButtonGroup } from "../ui/button-group";
import { buildZodSchema } from "./utils";

export default function FormGenerator({ formDescriptor }) {
    const schema = buildZodSchema(formDescriptor);
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: formDescriptor.defaultValues ?? {},
    });

    const handleSubmit = async values => {
        if (formDescriptor.submit?.action) {
            await formDescriptor.submit?.action(values);
        } else {
            console.log("Form submitted:", values);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {formDescriptor.fields.map(fieldDef => (
                    <FormField
                        key={fieldDef.name}
                        control={form.control}
                        name={fieldDef.name}
                        render={({ field }) => (
                            <FormItem
                                className={
                                    fieldDef.type === "checkbox"
                                        ? "flex flex-row items-start space-x-3 space-y-0"
                                        : "space-y-1"
                                }
                            >
                                {fieldDef.type !== "checkbox" && (
                                    <FormLabel>{fieldDef.label}</FormLabel>
                                )}

                                <FormControl>
                                    {fieldDef.type === "textarea" ? (
                                        <Textarea {...field} placeholder={fieldDef.placeholder} />
                                    ) : fieldDef.type === "password" ? (
                                        <PasswordInput
                                            {...field}
                                            placeholder={fieldDef.placeholder}
                                        />
                                    ) : fieldDef.type === "checkbox" ? (
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    ) : fieldDef.type === "select" ? (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={fieldDef.placeholder} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fieldDef.options?.map(option => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            {...field}
                                            type={fieldDef.type}
                                            placeholder={fieldDef.placeholder}
                                        />
                                    )}
                                </FormControl>

                                {fieldDef.type === "checkbox" && (
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>{fieldDef.label}</FormLabel>
                                        {fieldDef.description && (
                                            <FormDescription>
                                                {fieldDef.description}
                                            </FormDescription>
                                        )}
                                    </div>
                                )}

                                {fieldDef.type !== "checkbox" && fieldDef.description && (
                                    <FormDescription>{fieldDef.description}</FormDescription>
                                )}

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
                <ButtonGroup>
                    {formDescriptor.reset && (
                        <Button type="button" variant="outline" onClick={() => form.reset()}>
                            {formDescriptor.reset.label || "Reset"}
                        </Button>
                    )}
                    {formDescriptor.cancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => formDescriptor.cancel.action}
                        >
                            {formDescriptor.cancel.label || "Cancel"}
                        </Button>
                    )}
                    <Button variant={formDescriptor.submit?.variant || "default"} type="submit">
                        {formDescriptor.submit?.label || "Test"}
                    </Button>
                </ButtonGroup>
            </form>
        </Form>
    );
}
