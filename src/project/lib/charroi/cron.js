function normalizeDayOfWeek(value) {
    return value === 7 ? 0 : value;
}

function parseCronToken(token, min, max, { isDayOfWeek = false } = {}) {
    const values = new Set();
    const trimmedToken = token.trim();

    if (!trimmedToken) {
        throw new Error("Invalid cron token");
    }

    const [rangePart, stepPart] = trimmedToken.split("/");
    const step = stepPart == null ? 1 : Number.parseInt(stepPart, 10);

    if (!Number.isInteger(step) || step < 1) {
        throw new Error("Invalid cron step");
    }

    const addValue = value => {
        if (!Number.isInteger(value) || value < min || value > max) {
            throw new Error("Cron value out of range");
        }

        values.add(isDayOfWeek ? normalizeDayOfWeek(value) : value);
    };

    const addRange = (start, end) => {
        if (start > end) {
            throw new Error("Invalid cron range");
        }

        for (let current = start; current <= end; current += step) {
            addValue(current);
        }
    };

    if (rangePart === "*") {
        addRange(min, max);
        return values;
    }

    if (rangePart.includes("-")) {
        const [rawStart, rawEnd] = rangePart.split("-");
        const start = Number.parseInt(rawStart, 10);
        const end = Number.parseInt(rawEnd, 10);
        addRange(start, end);
        return values;
    }

    const numericValue = Number.parseInt(rangePart, 10);

    if (!Number.isInteger(numericValue)) {
        throw new Error("Invalid cron value");
    }

    addRange(numericValue, numericValue);
    return values;
}

function parseCronField(field, min, max, options = {}) {
    const trimmedField = field.trim();

    if (!trimmedField) {
        throw new Error("Missing cron field");
    }

    const values = new Set();

    for (const token of trimmedField.split(",")) {
        for (const value of parseCronToken(token, min, max, options)) {
            values.add(value);
        }
    }

    return values;
}

function getWeekdayValue(weekday) {
    const mapping = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };

    return mapping[weekday] ?? 0;
}

export function getTimeZoneDateParts(date, timeZone) {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
        weekday: "short",
    });

    const parts = formatter.formatToParts(date).reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {});

    return {
        year: Number.parseInt(parts.year, 10),
        month: Number.parseInt(parts.month, 10),
        day: Number.parseInt(parts.day, 10),
        hour: Number.parseInt(parts.hour, 10),
        minute: Number.parseInt(parts.minute, 10),
        dayOfWeek: getWeekdayValue(parts.weekday),
    };
}

export function getTimeZoneMinuteKey(date, timeZone) {
    const parts = getTimeZoneDateParts(date, timeZone);

    return [
        parts.year,
        String(parts.month).padStart(2, "0"),
        String(parts.day).padStart(2, "0"),
        String(parts.hour).padStart(2, "0"),
        String(parts.minute).padStart(2, "0"),
    ].join("-");
}

export function isValidCronExpression(expression) {
    try {
        const trimmedExpression = expression?.trim();

        if (!trimmedExpression) {
            return false;
        }

        const fields = trimmedExpression.split(/\s+/);

        if (fields.length !== 5) {
            return false;
        }

        parseCronField(fields[0], 0, 59);
        parseCronField(fields[1], 0, 23);
        parseCronField(fields[2], 1, 31);
        parseCronField(fields[3], 1, 12);
        parseCronField(fields[4], 0, 7, { isDayOfWeek: true });

        return true;
    } catch {
        return false;
    }
}

export function isCronDue(date, expression, timeZone = "Europe/Brussels") {
    if (!isValidCronExpression(expression)) {
        return false;
    }

    const [minuteField, hourField, dayField, monthField, weekDayField] = expression
        .trim()
        .split(/\s+/);

    const minuteValues = parseCronField(minuteField, 0, 59);
    const hourValues = parseCronField(hourField, 0, 23);
    const dayValues = parseCronField(dayField, 1, 31);
    const monthValues = parseCronField(monthField, 1, 12);
    const weekDayValues = parseCronField(weekDayField, 0, 7, { isDayOfWeek: true });
    const parts = getTimeZoneDateParts(date, timeZone);
    const isDayWildcard = dayField.trim() === "*";
    const isWeekDayWildcard = weekDayField.trim() === "*";
    const dayMatches = dayValues.has(parts.day);
    const weekDayMatches = weekDayValues.has(parts.dayOfWeek);
    const calendarMatches =
        isDayWildcard && isWeekDayWildcard
            ? true
            : isDayWildcard
              ? weekDayMatches
              : isWeekDayWildcard
                ? dayMatches
                : dayMatches || weekDayMatches;

    return (
        minuteValues.has(parts.minute) &&
        hourValues.has(parts.hour) &&
        monthValues.has(parts.month) &&
        calendarMatches
    );
}
