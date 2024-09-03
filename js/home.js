const defaultSvgOptions = {
	// Tracing
	corsenabled: false,
	ltres: 1,
	qtres: 1,
	pathomit: 8,
	rightangleenhance: true,

	// Color quantization
	colorsampling: 2,
	numberofcolors: 16,
	mincolorratio: 0,
	colorquantcycles: 3,

	// Layering method
	layering: 0,

	// SVG rendering
	strokewidth: 1,
	linefilter: false,
	scale: 1,
	roundcoords: 1,
	viewbox: true,
	desc: false,
	lcpr: 0,
	qcpr: 0,

	// Blur
	blurradius: 0,
	blurdelta: 20
}

// const defaultSvgOptions = {
// 	// Tracing
// 	corsenabled: false,
// 	ltres: 1,
// 	qtres: 1,
// 	pathomit: 8,
// 	rightangleenhance: true,

// 	// Color quantization
// 	colorsampling: 0, // Set to 0 for a fixed number of colors
// 	numberofcolors: 2, // Limit colors to black and white
// 	mincolorratio: 1, // Increase to prioritize dominant colors (black and white)
// 	colorquantcycles: 1, // Reduce the number of quantization cycles for a simpler result

// 	// Layering method
// 	layering: 0,

// 	// SVG rendering
// 	strokewidth: 1,
// 	linefilter: false,
// 	scale: 1,
// 	roundcoords: 1,
// 	viewbox: true,
// 	desc: false,
// 	lcpr: 0,
// 	qcpr: 0,

// 	// Blur
// 	blurradius: 0,
// 	blurdelta: 20
// };

$(document).ready(function () {
	const imageInput = document.getElementById('image-input');
	const svgCodeOutput = document.getElementById('svg-code-output');
	const svgPreviewOutput = document.getElementById('svg-output-preview');

	svgCodeOutput.addEventListener('change', () => {
		const currentCode = svgCodeOutput.value;

		if (currentCode == '') {
			svgPreviewOutput.textContent = '';
			return;
		}
		else if (isInvalidSVG(currentCode)) {
			svgPreviewOutput.textContent = 'Not a valid SVG Code';
			return;
		}

		svgPreviewOutput.textContent = '';
		ImageTracer.appendSVGString(currentCode, svgPreviewOutput.id);
	});

	imageInput.addEventListener('change', (evt) => {
		if (!evt) {
			console.log('Invalid!');
			imageInput.value = '';
			return;
		}

		const file = evt.target.files[0];
		if (!file) {
			console.log('Invalid!');
			return;
		}

		const tempURL = URL.createObjectURL(file);
		ImageTracer.imageToSVG(
			tempURL, function (svgString) {
				svgCodeOutput.value = svgString;
				svgCodeOutput.dispatchEvent(new Event('change'));
				// svgPreviewOutput.textContent = '';
				// ImageTracer.appendSVGString(svgString, svgPreviewOutput.id);
			}, defaultSvgOptions
		);
	});

	document.getElementById('copy-button').addEventListener('click', () => {
		copyUrl(svgCodeOutput.value);
	});

	// waits for document to load base promises
	isDocumentReady().then((isReady) => {
		if (!isReady) {
			documentNotReady();
			return;
		}

		const fetchList = {}

		waitForAllPromises(fetchList).then((result) => {
			hideLoadingScreen();
		});
	});
});

function isInvalidSVG(text) {
	try {
		// Parse the text as XML
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(text, "image/svg+xml");

		// Check for parsing errors
		const parseError = xmlDoc.getElementsByTagName("parsererror");
		if (parseError.length > 0) {
			return true; // Text is not a valid SVG
		}

		// Check if the root element is an SVG element
		const rootElement = xmlDoc.documentElement;
		if (rootElement.nodeName !== "svg") {
			return true; // Text is not a valid SVG
		}

		return false; // Text is a valid SVG
	} catch (e) {
		return true; // An error occurred, so it's not a valid SVG
	}
}

function copyUrl(url) {
	if (navigator.clipboard) {
		navigator.clipboard.writeText(url);
		return; // code should end here normally
	}

	// this is just for it to work on http (i.e. localhost), where clipoardAPI is not permitted
	const textArea = document.createElement("textarea");
	textArea.value = url;
	document.body.appendChild(textArea);
	textArea.focus({ preventScroll: true })
	textArea.select();
	try {
		document.execCommand('copy');
		alert('text copied!');
	} catch (err) {
		console.error('Unable to copy to clipboard', err);
	}
	document.body.removeChild(textArea);
}