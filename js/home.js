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
	svgConverter();

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

function svgConverter() {
	const imageInput = document.getElementById('image-input');
	const svgCodeOutput = document.getElementById('svg-code-output');
	const svgPreviewOutput = document.getElementById('svg-output-preview');

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	// allow to input preferred size
	canvas.width = 512;
	canvas.height = 512;

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

		const img = new Image();
		const tempUrl = URL.createObjectURL(file);
		let imageUrl = tempUrl;
		img.addEventListener('load', () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			const resizedImageUrl = canvas.toDataURL();

			if (false) { // check if preferred size is active
				imageUrl = resizedImageUrl;
			}

			ImageTracer.imageToSVG(
				imageUrl,
				(svgString) => {
					svgCodeOutput.value = svgString;
					svgCodeOutput.dispatchEvent(new Event('change'));
				},
				defaultSvgOptions
			);
		})
		img.src = tempUrl;
	});

	document.getElementById('copy-button').addEventListener('click', () => {
		copyUrl(svgCodeOutput.value);
	});
}

function isInvalidSVG(text) {
	try {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(text, "image/svg+xml");

		const parseError = xmlDoc.getElementsByTagName("parsererror");
		if (parseError.length > 0) {
			return true;
		}

		const rootElement = xmlDoc.documentElement;
		if (rootElement.nodeName !== "svg") {
			return true;
		}

		return false;
	} catch (e) {
		return true;
	}
}

function copyUrl(url) {
	if (navigator.clipboard) {
		navigator.clipboard.writeText(url);
		alert('text copied!');
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