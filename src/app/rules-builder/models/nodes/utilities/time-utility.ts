class TimeUtility {

    toTimeString(minutes: number) {
        var intHours = Math.floor(minutes / 60),
            hh = intHours < 10 ? `0${intHours}` : intHours,
            intMinutes = minutes % 60,
            mm = intMinutes < 10 ? `0${intMinutes}` : intMinutes;

        return `${hh}:${mm}`;
    }

    getMinutes(timeString: string): number {
        if (!timeString) return undefined;

        var [strHours, strMinutes] = timeString.split(":");

        return parseInt(strHours, 10) * 60 + parseInt(strMinutes, 10);
    }
}

export default new TimeUtility();