import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	DocumentHighlightOptions,
	DocumentHighlight, 
	DocumentHighlightParams,
	DocumentHighlightKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	ServerRequestHandler,
	TextDocumentIdentifier,
	Command,
	Color,
	ColorInformation,
	ColorPresentation,
	SemanticTokensBuilder,
	SemanticTokensLegend,
	SemanticTokensClientCapabilities,
	SemanticTokensRegistrationType,
	SemanticTokensRegistrationOptions,
	SemanticTokensDeltaRequest
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import { Server, ServerResponse } from 'http';
import { text } from 'stream/consumers';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

enum TokenTypes {
	comment = 0,
	keyword = 1,
	string = 2,
	number = 3,
	regexp = 4,
	type = 5,
	class = 6,
	interface = 7,
	enum = 8,
	typeParameter = 9,
	function = 10,
	member = 11,
	property = 12,
	variable = 13,
	parameter = 14,
	lambdaFunction = 15,
	_ = 16
}

enum TokenModifiers {
	abstract = 0,
	deprecated = 1,
	_ = 2,
}

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

let semanticTokensLegend: SemanticTokensLegend;
function computeLegend(capability: SemanticTokensClientCapabilities): SemanticTokensLegend {

	const clientTokenTypes = new Set<string>(capability.tokenTypes);
	const clientTokenModifiers = new Set<string>(capability.tokenModifiers);

	const tokenTypes: string[] = [];
	for (let i = 0; i < TokenTypes._; i++) {
		const str = TokenTypes[i];
		if (clientTokenTypes.has(str)) {
			tokenTypes.push(str);
		} else {
			if (str === 'lambdaFunction') {
				tokenTypes.push('function');
			} else {
				tokenTypes.push('type');
			}
		}
	}

	const tokenModifiers: string[] = [];
	for (let i = 0; i < TokenModifiers._; i++) {
		const str = TokenModifiers[i];
		if (clientTokenModifiers.has(str)) {
			tokenModifiers.push(str);
		}
	}

	return { tokenTypes, tokenModifiers };
}

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			},
			documentHighlightProvider: true,
			colorProvider: true
		}
	};
	semanticTokensLegend = computeLegend(params.capabilities.textDocument!.semanticTokens!);
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
	const registrationOptions: SemanticTokensRegistrationOptions = {
		documentSelector: ['jay'],
		legend: semanticTokensLegend,
		range: false,
		full: {
			delta: true
		}
	};
	//connection.client.register(SemanticTokensRegistrationType.type, registrationOptions);
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}



// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
	
});

/*connection.onDocumentHighlight((params) => {
	connection.console.log('Found a highlight at line ' + params.position.line);
	let textPosition = params.position;
	const textDocument = params.textDocument;
	let word = documents.get(textDocument.uri)?.getText().charAt(textPosition.line + textPosition.character);
	return [
		DocumentHighlight.create({
			start: {line: textPosition.line + 1, character: textPosition.character},
			end: {line: textPosition.line + 1, character: textPosition.character + 8}
		})
	];
});*/
connection.onDocumentColor((params) => getColorInformation(params.textDocument));

function getColorInformation(document: TextDocumentIdentifier): ColorInformation[] {
	return [];
}

connection.onDocumentHighlight((params:DocumentHighlightParams): DocumentHighlight[] => []); //getDocumentHighlights(params.textDocument));

function getDocumentHighlights(document: TextDocumentIdentifier): DocumentHighlight[] {
	
	const keywords = /\b(let|rec|match|with|end)\b/g;
	const highlights :DocumentHighlight[] = [];
	const resolvedDocument: TextDocument|undefined = documents.get(document.uri);
	if (!resolvedDocument) {
		return [];
	}
	const documentToHighlight = documents.get(document.uri);
	if (!documentToHighlight) {
		return [];
	}
	const text = documentToHighlight.getText();
	let hMatch;
	while ((hMatch = keywords.exec(text))) {
		const nextHighlight: DocumentHighlight = {
			range : {
				start: resolvedDocument.positionAt(hMatch.index),
				end: resolvedDocument.positionAt(hMatch.index + hMatch[0].length)
			},
			kind: DocumentHighlightKind.Text
		};
		highlights.push(nextHighlight);
	}

	return highlights;

}


async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	//console.log('validating document');
	// In this simple example we get the settings for every validate run.
	const settings = await getDocumentSettings(textDocument.uri);

	// The validator creates diagnostics for all uppercase words length 2 and more
	const text = textDocument.getText();
	const pattern = /\b[A-Z]{2,}\b/g;
	let m: RegExpExecArray | null;

	let problems = 0;
	const diagnostics: Diagnostic[] = [];
	while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: textDocument.positionAt(m.index),
				end: textDocument.positionAt(m.index + m[0].length)
			},
			message: `${m[0]} is all uppercase.`,
			source: 'ex'
		};
		if (hasDiagnosticRelatedInformationCapability) {
			diagnostic.relatedInformation = [
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'Spelling matters'
				},
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'Particularly for names'
				}
			];
		}
		//diagnostics.push(diagnostic);
	}

	// Send the computed diagnostics to VSCode.
	//connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		return [];
		// return [
		// 	{
		// 		label: 'TypeScript',
		// 		kind: CompletionItemKind.Text,
		// 		data: 1
		// 	},
		// 	{
		// 		label: 'JavaScript',
		// 		kind: CompletionItemKind.Text,
		// 		data: 2
		// 	}
		// ];
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		return item;
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
