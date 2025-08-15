
export function getEventSlug(path: string) {
    return path.split('/').slice(2).slice(0, -1).join('/');
}

