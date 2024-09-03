var documentReady = false;

$(document).ready(function () {
	const basePromiseList = {}

	waitForAllPromises(basePromiseList).then((fetchedResults) => { documentReady = true; });
});

async function waitForAllPromises(promises) {
	const promiseKeys = Object.keys(promises);
	const promiseList = Object.values(promises);

	return Promise.all(promiseList).then((promiseResults) => {
		const mappedResults = {};
		promiseResults.forEach((result, i) => {
			mappedResults[promiseKeys[i]] = result;
		});
		return mappedResults;
	});
}

function isDocumentReady() {
	return new Promise((resolve) => {
		const intervalId = setInterval(() => {
			if (documentReady) {
				clearInterval(intervalId);
				resolve(true);
			}
		}, 50);
	});
}

function promiseWithTimeout(promise, timeoutTime) {
	return new Promise((resolve) => {
		const timer = setTimeout(() => {
			resolve('Timeout');
		}, timeoutTime);

		promise.then((value) => {
			clearTimeout(timer);
			resolve(value);
		});
	});
}

function documentNotReady() {
	// @TODO: develop further
	console.log('Error loading webpage\nSome files could not be included!');
}

// *** HTML HANDLE FUNCTIONS ***

function create(elementType, innerTagText = null, attributes = null, classList = null, children = null, events = null) {
	const createdElement = document.createElement(elementType);

	if (attributes != null && attributes.constructor == Object) {
		for (const attributeKey in attributes) {
			const attributeValue = attributes[attributeKey];
			createdElement[attributeKey] = attributeValue;
		}
	}

	if (innerTagText != null) {
		if (innerTagText.includes('//')) createdElement.innerHTML = innerTagText.replace('//', '');
		else createdElement.textContent = innerTagText;
	}

	if (classList != null) addClasses(createdElement, classList);

	if (children != null) addChildren(createdElement, children);

	if (events != null) {
		for (const eventType in events) {
			const eventFunction = events[eventType];
			createdElement.addEventListener(eventType, eventFunction);
		}
	}

	return createdElement;
}

function addChildren(parentElement, children, first = false) {
	if (!Array.isArray(children)) {
		if (first) {
			parentElement.insertBefore(children, parentElement.firstChild);
		} else {
			children = [children];
			for (const childKey in children) {
				const childElement = children[childKey];
				parentElement.appendChild(childElement);
			}
		}
	} else {
		for (const childKey in children) {
			const childElement = children[childKey];
			parentElement.appendChild(childElement);
		}
	}
}

function addClasses(element, classList) {
	if (!Array.isArray(classList)) classList = classList.split(' ');

	for (const classKey in classList) {
		const classAttr = classList[classKey];
		if (classAttr) element.classList.add(classAttr);
	}
}

function addEvent(element, eventType, event) {
	element.addEventListener(eventType, event);
}

// *** LOADING SCREEN ***

function showLoadingScreen(time = 400) {
	$('#loading-screen').fadeIn(time);
}

function hideLoadingScreen(time = 400) {
	$('#loading-screen').fadeOut(time);
}

// *** OTHER ***

function toggleTheme() {
	const currentTheme = document.body.getAttribute('data-theme');
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
	document.body.setAttribute('data-theme', newTheme);
	localStorage.setItem('colorTheme', newTheme);
}