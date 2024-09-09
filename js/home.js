const defaultSvgOptions = {
	corsenabled: false,
	ltres: 1,
	qtres: 1,
	pathomit: 8,
	rightangleenhance: true,
	colorsampling: 2,
	numberofcolors: 16,
	mincolorratio: 0,
	colorquantcycles: 3,
	layering: 0,
	strokewidth: 1,
	linefilter: false,
	scale: 1,
	roundcoords: 1,
	viewbox: true,
	desc: false,
	lcpr: 0,
	qcpr: 0,
	blurradius: 0,
	blurdelta: 20
}

const blackAndWhiteOptions = {
	corsenabled: false,
	ltres: 1,
	qtres: 1,
	pathomit: 8,
	rightangleenhance: true,
	colorsampling: 0,
	numberofcolors: 2,
	mincolorratio: 1,
	colorquantcycles: 1,
	layering: 0,
	strokewidth: 1,
	linefilter: false,
	scale: 1,
	roundcoords: 1,
	viewbox: true,
	desc: false,
	lcpr: 0,
	qcpr: 0,
	blurradius: 0,
	blurdelta: 20
};

var preferredSizeActive = false;
var preferredWidth = 64;
var preferredHeight = 64;

document.addEventListener('DOMContentLoaded', function () {
	svgConverter();

	// waits for document to load base promises
	isDocumentReady().then((isReady) => {
		if (!isReady) {
			documentNotReady();
			return;
		}

		const fetchList = {}

		waitForAllPromises(fetchList).then((result) => {
			// hideLoadingScreen();
		});
	});
});

function svgConverter() {
	const imageInput = document.getElementById('image-input');
	const svgCodeOutput = document.getElementById('svg-code-output');
	const svgPreviewOutput = document.getElementById('svg-preview');

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	// allow to input preferred size
	canvas.width = preferredWidth;
	canvas.height = preferredHeight;

	svgCodeOutput.addEventListener('change', function () {
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
		img.addEventListener('load', function () {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			const resizedImageUrl = canvas.toDataURL();

			if (preferredSizeActive) { // check if preferred size is active
				imageUrl = resizedImageUrl;
			}

			ImageTracer.imageToSVG(
				imageUrl,
				(svgString) => {
					svgCodeOutput.value = svgString;
					svgCodeOutput.dispatchEvent(new Event('change'));
					imageInput.value = ''; // to reset input
				},
				defaultSvgOptions
			);
		})
		img.src = tempUrl;
	});

	document.getElementById('copy-button').addEventListener('click', function () {
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