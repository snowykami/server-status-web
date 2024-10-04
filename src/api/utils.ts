export const onlineTimeout = 30

export function getLinuxReleaseIcon(name: string, release: string): { name: string, icon: string } {
    if (name.toLowerCase() == 'windows') {
        return {name: 'Windows', icon: '/svg/system-windows.svg'}
    } else {
        const map: Record<string, { name: string, icon: string }> = {
            'arch': {name: 'Arch Linux', icon: '/svg/system-archlinux.svg'},
            'opensuse': {name: 'openSUSE', icon: '/svg/system-opensuse.svg'},
            'ubuntu': {name: 'Ubuntu', icon: '/svg/system-ubuntu.svg'},
            'centos': {name: 'CentOS', icon: '/svg/system-centos.svg'},
            'debian': {name: 'Debian', icon: '/svg/system-debian.svg'},
        }
        release = release.toLowerCase()
        for (const key in map) {
            if (release.includes(key)) {
                return map[key]
            }
        }
        return {name: name, icon: '/svg/system-linux.svg'}
    }
}

export function formatSizeByUnit(bytes: number, unit: string | null = null, suffix: string | null = null): string {
    // 若指定单位，则格式化为指定单位对应的大小字符串加上单位
    // 若未指定单位，则选择1-1024之间的最大单位，格式化为该单位对应的大小字符串加上单位
    if (bytes == 0) {
        return '0'
    }
    if (bytes < 1024) {
        return bytes.toFixed(0) + (suffix ? suffix : '')
    }
    const units = ['', 'K', 'M', 'G', 'T', 'P', 'E']
    let i = unit ? units.indexOf(unit) : Math.floor(Math.log2(bytes) / 10)
    return (bytes / Math.pow(1024, i)).toFixed(1) + (suffix ? (units[i] + suffix) : '')
}

export function formatSizeToNumAndUnit(bytes: number): { num: number, unit: string } {
    const units = ['', 'K', 'M', 'G', 'T', 'P', 'E']
    let i = Math.floor(Math.log2(bytes) / 10)
    return {num: (bytes / Math.pow(1024, i)), unit: units[i]}
}

export function format2Size(num1: number, num2: number, suffix: string | null = 'iB'): string {
    // const n1, unit = formatSizeToNumAndUnit(num1)
    // const n2 = formatSizeWithUnit(num2, unit)
    // return `${n1}/${n2}`
    // const r1 = formatSizeToNumAndUnit(num1)
    // let n2 = formatSizeWithUnit(num2, r1.unit)
    // return `${r1.num.toFixed(2)}/${n2}`
    const r2 = formatSizeToNumAndUnit(num2)
    const n1 = formatSizeByUnit(num1, r2.unit)
    return `${n1}/${r2.num.toFixed(1)}${r2.unit}${suffix}`
}

export function formatDate(timestamp: number, timeOnly: boolean = false) {
    const d = new Date(timestamp * 1000)
    const date = d.toLocaleDateString()
    const time = d.toLocaleTimeString()
    return timeOnly ? time : `${date} ${time}`
}

export function getBaseColor(percent: number, disable: boolean = false) {
    // 获取基础颜色
    // 0~60: green, 60~80: yellow, 80~90: orange, 90~100: red
    if (disable) {
        return '#9ca3af'
    }
    if (percent < 60) {
        return '#22c55e'
    } else if (percent < 80) {
        return '#eab308'
    } else if (percent < 90) {
        return '#f97316'
    } else {
        return '#ef4444'
    }
}


export function getBlankColor(percent: number, disable: boolean = false) {
    if (disable) {
        return '#e5e7eb'
    }

    //相比base更浅的颜色
    if (percent < 60) {
        return '#bbf7d0'
    } else if (percent < 80) {
        return '#fef08a'
    } else if (percent < 90) {
        return '#fed7aa'
    } else {
        return '#fecaca'
    }
}

// 1727998501

export function formatUptime(uptime: number ): string {

    const seconds = uptime
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${d}:${h}:${m}:${s}`
}