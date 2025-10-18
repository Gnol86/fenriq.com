/**
 * ============================================================
 * EXAMPLE: Custom React Hook
 * ============================================================
 *
 * This is an example of a project-specific custom hook.
 * Hooks encapsulate reusable logic for components.
 *
 * Location: src/project/hooks/
 * Naming: Always prefix with "use"
 * Usage: Import with @project/hooks/use-my-hook
 * ============================================================
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useServerAction } from "@/hooks/use-server-action";
// import { getItems } from "@project/actions/my.action";

/**
 * Example Hook: Fetch and manage items
 */
export function useItems() {
    const [items, _setItems] = useState([]);
    const { isPending } = useServerAction();

    // Load items function
    const loadItems = useCallback(async () => {
        // Uncomment when you have actual getItems action
        // const result = await execute(() => getItems());
        // if (result) {
        //     _setItems(result);
        // }
    }, []);

    // Load items on mount
    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const refresh = () => {
        loadItems();
    };

    return {
        items,
        loading: isPending,
        refresh,
    };
}

/**
 * Example Hook: Form state management
 */
export function useItemForm(initialValues = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!values.name || values.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (values.price && values.price < 0) {
            newErrors.price = "Price must be positive";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setIsDirty(false);
    };

    return {
        values,
        errors,
        isDirty,
        handleChange,
        validate,
        reset,
    };
}

/**
 * Example Hook: Toggle state
 */
export function useToggle(initialState = false) {
    const [state, setState] = useState(initialState);

    const toggle = () => setState(prev => !prev);
    const setTrue = () => setState(true);
    const setFalse = () => setState(false);

    return {
        state,
        toggle,
        setTrue,
        setFalse,
    };
}

/**
 * ============================================================
 * USAGE IN COMPONENT
 * ============================================================
 *
 * import { useItems, useItemForm, useToggle } from "@project/hooks/use-items";
 *
 * export default function MyComponent() {
 *     const { items, loading, refresh } = useItems();
 *     const form = useItemForm({ name: "", price: 0 });
 *     const { state: isOpen, toggle } = useToggle();
 *
 *     const handleSubmit = async () => {
 *         if (!form.validate()) return;
 *
 *         // Submit logic here
 *         await createItem(form.values);
 *
 *         form.reset();
 *         refresh();
 *     };
 *
 *     return (
 *         <div>
 *             {loading ? "Loading..." : items.map(item => ...)}
 *             <button onClick={toggle}>Toggle Dialog</button>
 *         </div>
 *     );
 * }
 *
 * ============================================================
 */
