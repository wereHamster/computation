coverage:
	jscoverage --no-highlight computation.js
	COMPUTATION=computation-cov.js mocha -R html-cov > coverage.html
	rm computation-cov.js
