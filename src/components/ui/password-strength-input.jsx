"use client";

import * as React from "react";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordStrengthInput = React.forwardRef(
    ({ className, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const [password, setPassword] = React.useState(props.value || "");

        const disabled = props.disabled;

        const toggleVisibility = () => setShowPassword((prev) => !prev);

        const checkStrength = (pass) => {
            const requirements = [
                { regex: /.{8,}/, text: "Au moins 8 caractères" },
                { regex: /[0-9]/, text: "Au moins 1 chiffre" },
                { regex: /[a-z]/, text: "Au moins 1 minuscule" },
                { regex: /[A-Z]/, text: "Au moins 1 majuscule" },
            ];

            return requirements.map((req) => ({
                met: req.regex.test(pass),
                text: req.text,
            }));
        };

        const strength = checkStrength(password);
        const strengthScore = React.useMemo(() => {
            return strength.filter((req) => req.met).length;
        }, [strength]);

        const getStrengthColor = (score) => {
            if (score === 0) return "bg-border";
            if (score <= 1) return "bg-red-500";
            if (score <= 2) return "bg-orange-500";
            if (score === 3) return "bg-amber-500";
            return "bg-emerald-500";
        };

        const handleChange = (e) => {
            const value = e.target.value;
            setPassword(value);
            if (props.onChange) {
                props.onChange(e);
            }
        };

        React.useEffect(() => {
            if (props.value !== undefined) {
                setPassword(props.value);
            }
        }, [props.value]);

        return (
            <div>
                {/* Password input field with toggle visibility button */}
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
                        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex items-center justify-center transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={toggleVisibility}
                        disabled={disabled}
                        aria-label={
                            showPassword
                                ? "Masquer le mot de passe"
                                : "Afficher le mot de passe"
                        }
                        aria-pressed={showPassword}
                    >
                        {showPassword && !disabled ? (
                            <EyeIcon className="h-4 w-4" aria-hidden="true" />
                        ) : (
                            <EyeOffIcon
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        )}
                    </button>

                    {/* hides browsers password toggles */}
                    <style>{`
                    .hide-password-toggle::-ms-reveal,
                    .hide-password-toggle::-ms-clear {
                        visibility: hidden;
                        pointer-events: none;
                        display: none;
                    }
                `}</style>
                </div>

                {/* Password strength indicator */}
                {password && (
                    <>
                        <div
                            className="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full"
                            role="progressbar"
                            aria-valuenow={strengthScore}
                            aria-valuemin={0}
                            aria-valuemax={4}
                            aria-label="Force du mot de passe"
                        >
                            <div
                                className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
                                style={{
                                    width: `${(strengthScore / 4) * 100}%`,
                                }}
                            ></div>
                        </div>

                        {/* Password strength description */}
                        <p className="text-muted-foreground mb-2 text-sm font-medium">
                            Doit contenir :
                        </p>

                        {/* Password requirements list */}
                        <ul
                            className="grid grid-cols-2 gap-1.5"
                            aria-label="Exigences du mot de passe"
                        >
                            {strength.map((req, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    {req.met ? (
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
                                        className={`text-xs ${req.met ? "text-emerald-600" : "text-destructive"}`}
                                    >
                                        {req.text}
                                        <span className="sr-only">
                                            {req.met
                                                ? " - Exigence respectée"
                                                : " - Exigence non respectée"}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        );
    }
);

PasswordStrengthInput.displayName = "PasswordStrengthInput";

export { PasswordStrengthInput };
