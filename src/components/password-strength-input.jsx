"use client";

import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PASSWORD_REQUIREMENTS = [
    { key: "min_length", regex: /.{8,}/ },
    { key: "digit_required", regex: /[0-9]/ },
    { key: "lowercase_required", regex: /[a-z]/ },
    { key: "uppercase_required", regex: /[A-Z]/ },
];

const getStrengthState = score => {
    if (score === 0) {
        return {
            indicatorClassName: "bg-border",
            textClassName: "text-muted-foreground",
            labelKey: "level_weak",
        };
    }

    if (score === 1) {
        return {
            indicatorClassName: "bg-red-500",
            textClassName: "text-red-500",
            labelKey: "level_weak",
        };
    }

    if (score === 2) {
        return {
            indicatorClassName: "bg-orange-500",
            textClassName: "text-orange-500",
            labelKey: "level_medium",
        };
    }

    if (score === 3) {
        return {
            indicatorClassName: "bg-amber-500",
            textClassName: "text-amber-500",
            labelKey: "level_medium",
        };
    }

    return {
        indicatorClassName: "bg-emerald-500",
        textClassName: "text-emerald-500",
        labelKey: "level_strong",
    };
};

const PasswordStrengthInput = React.forwardRef(({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [password, setPassword] = React.useState(props.value ?? props.defaultValue ?? "");
    const t = useTranslations("common");
    const isToggleDisabled = props.disabled || password === "";

    const requirements = PASSWORD_REQUIREMENTS.map(requirement => ({
        ...requirement,
        met: requirement.regex.test(password),
        text: t(`password_strength.${requirement.key}`),
    }));
    const strengthScore = requirements.filter(requirement => requirement.met).length;
    const strengthState = getStrengthState(strengthScore);

    const handleChange = event => {
        const { value } = event.target;
        setPassword(value);
        props.onChange?.(event);
    };

    React.useEffect(() => {
        if (props.value !== undefined) {
            setPassword(props.value ?? "");
        }
    }, [props.value]);

    React.useEffect(() => {
        if (password === "") {
            setShowPassword(false);
        }
    }, [password]);

    return (
        <div>
            <div className="relative">
                <Input
                    {...props}
                    ref={ref}
                    type={showPassword ? "text" : "password"}
                    className={cn("hide-password-toggle pr-10", className)}
                    value={password}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute top-0 right-0 flex h-full items-center justify-center px-3 py-2 transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setShowPassword(previous => !previous)}
                    disabled={isToggleDisabled}
                    aria-label={showPassword ? t("hide_password") : t("show_password")}
                    aria-pressed={showPassword}
                >
                    {showPassword && !isToggleDisabled ? (
                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                </button>

                <style>{`
                    .hide-password-toggle::-ms-reveal,
                    .hide-password-toggle::-ms-clear {
                        visibility: hidden;
                        pointer-events: none;
                        display: none;
                    }
                `}</style>
            </div>

            {password && (
                <>
                    <div
                        className="bg-border mt-3 mb-1 h-1 w-full overflow-hidden rounded-full"
                        role="progressbar"
                        aria-valuenow={strengthScore}
                        aria-valuemin={0}
                        aria-valuemax={4}
                        aria-label={t("password_strength.progress_aria_label")}
                    >
                        <div
                            className={`h-full ${strengthState.indicatorClassName} transition-all duration-500 ease-out`}
                            style={{
                                width: `${(strengthScore / 4) * 100}%`,
                            }}
                        />
                    </div>

                    <p className={cn("mb-2 text-xs font-bold", strengthState.textClassName)}>
                        {t("password_strength.level_label")}:{" "}
                        {t(`password_strength.${strengthState.labelKey}`)}
                    </p>

                    <p className="text-muted-foreground mb-2 text-sm font-medium">
                        {t("password_strength.title")}
                    </p>

                    <ul
                        className="grid grid-cols-2 gap-1.5"
                        aria-label={t("password_strength.requirements_aria_label")}
                    >
                        {requirements.map(requirement => (
                            <li key={requirement.key} className="flex items-center gap-2">
                                {requirement.met ? (
                                    <CheckIcon
                                        size={16}
                                        className="text-emerald-500"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <XIcon
                                        size={16}
                                        className="text-destructive/80"
                                        aria-hidden="true"
                                    />
                                )}
                                <span
                                    className={`text-xs ${requirement.met ? "text-emerald-600" : "text-destructive"}`}
                                >
                                    {requirement.text}
                                    <span className="sr-only">
                                        {" - "}
                                        {requirement.met
                                            ? t("password_strength.requirement_met")
                                            : t("password_strength.requirement_unmet")}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
});

PasswordStrengthInput.displayName = "PasswordStrengthInput";

export { PasswordStrengthInput };
