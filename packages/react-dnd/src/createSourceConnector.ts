import * as React from 'react'
import wrapConnectorHooks from './wrapConnectorHooks'
import { Backend, Unsubscribe, Identifier } from 'dnd-core'
import { isRef } from './hooks/util'

export default function createSourceConnector(backend: Backend) {
	let currentHandlerId: Identifier

	// The drop target may either be attached via ref or connect function
	let dragSourceRef = React.createRef<any>()
	let dragSourceNode: any
	let dragSourceOptions: any
	let disconnectDragSource: Unsubscribe | undefined

	// The drag preview may either be attached via ref or connect function
	let dragPreviewRef = React.createRef<any>()
	let dragPreviewNode: any
	let dragPreviewOptions: any
	let disconnectDragPreview: Unsubscribe | undefined

	function reconnectDragSource() {
		if (disconnectDragSource) {
			disconnectDragSource()
			disconnectDragSource = undefined
		}

		const dragSource = dragSourceNode || dragSourceRef.current
		if (currentHandlerId && dragSource) {
			disconnectDragSource = backend.connectDragSource(
				currentHandlerId,
				dragSource,
				dragSourceOptions,
			)
		}
	}

	function reconnectDragPreview() {
		if (disconnectDragPreview) {
			disconnectDragPreview()
			disconnectDragPreview = undefined
		}

		const dragPreview = dragPreviewNode || dragPreviewRef.current
		if (currentHandlerId && dragPreview) {
			disconnectDragPreview = backend.connectDragPreview(
				currentHandlerId,
				dragPreview,
				dragPreviewOptions,
			)
		}
	}

	function receiveHandlerId(handlerId: Identifier) {
		if (handlerId === currentHandlerId) {
			return
		}

		currentHandlerId = handlerId
		reconnectDragSource()
		reconnectDragPreview()
	}

	return {
		receiveHandlerId,
		hooks: wrapConnectorHooks({
			dragSourceRef,
			dragPreviewRef,
			dragSource: function connectDragSource(node: any, options?: any) {
				dragSourceOptions = options
				if (isRef(node)) {
					dragSourceRef = node
				} else {
					dragSourceNode = node
				}
			},

			dragPreview: function connectDragPreview(node: any, options?: any) {
				dragPreviewOptions = options
				if (isRef(node)) {
					dragPreviewRef = node
				} else {
					dragPreviewNode = node
				}
			},
		}),
		reconnect: () => {
			reconnectDragSource()
			reconnectDragPreview()
		},
	}
}
