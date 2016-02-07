define ([
	"dust", "moment"
], function (dust, moment) {
	// filter to short description
	dust.filters.substr = function(value) {
		var v = value ? value.toString() : '';
		if (v.length > 123) {
			v = v.substring(0, 123) + '...';
		}
		return v;
	}
	// filter to short dates
	dust.filters.calendar = function(value) {
		var v = value ? value.toString() : null;
		return moment(v).calendar();;
	}
	return dust;
});
