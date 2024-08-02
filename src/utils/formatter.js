export function formatNumber(number) {
    return number.toLocaleString();
}

export function formatDate(date) {
    return date.toLocaleDateString();
}

export function formatTime(date) {
    return date.toLocaleTimeString();
}

export function formatDateTime(date) {
    return `${formatDate(date)} ${formatTime(date)}`;
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function truncateString(str, num) {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
}

export function formatPercentage(number) {
    return `${(number * 100).toFixed(2)}%`;
}

export function formatStat(value) {
    let formattedValue;
    let fullValue = value.toLocaleString(); // 천 단위 구분자 적용

    if (value >= 1000000) {
        formattedValue = (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        formattedValue = (value / 1000).toFixed(1) + 'k';
    } else {
        formattedValue = fullValue;
    }

    return `<span title="${fullValue}">${formattedValue}</span>`;
}