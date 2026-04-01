// type =[creation / modification]
export default function formatDate(dateString, type = 'creation') {
    if (!dateString) return '';

    const date = new Date(dateString);

    // Extract date components (common for both)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (type === 'creation' || type === 'dateOnly') {
        return `${day}/${month}/${year}`;
    } else if (type === 'modification' || type === 'datetime') {
        // Extract time for modification
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';

        hours = hours % 12;
        hours = hours ? hours : 12;

        const time = `${hours}:${minutes} ${ampm}`;
        return `${day}/${month}/${year} ${time}`;
    }

    return `${day}/${month}/${year}`; // Default fallback
}