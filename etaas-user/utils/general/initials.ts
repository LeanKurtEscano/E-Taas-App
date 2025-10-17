export const getInitials = (name?: string | null): string => {
        if (name) {
            const names = name.trim().split(' ');
            return names.length > 1
                ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
                : names[0].substring(0, 2).toUpperCase();
        }
        return 'S';
    };
