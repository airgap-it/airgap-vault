package it.airgap.vault.util

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class ExecutableDeferred<T> private constructor(
    private val completableDeferred: CompletableDeferred<T>,
    private val init: suspend () -> T,
) : Deferred<T> by completableDeferred {
    constructor(init: suspend () -> T) : this(CompletableDeferred(), init)

    private val mutex: Mutex = Mutex()

    override suspend fun await(): T = mutex.withLock {
        if (!completableDeferred.isCompleted) {
            coroutineScope {
                launch {
                    completableDeferred.complete(init())
                }
            }
        }

        completableDeferred.await()
    }
}