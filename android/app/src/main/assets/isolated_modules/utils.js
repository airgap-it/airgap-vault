function createOnError(description, handler) {
  return function(error) {
      var fullDescription
      if (typeof error === 'string') {
          if (typeof description === 'string') {
              fullDescription = `${description} (${error})`
          } else {
              fullDescription = error
          }
      } else if (typeof error === 'object' && typeof error.message === 'string') {
          if (typeof description === 'string') {
              fullDescription = `${description} (${error.message})`
          } else {
              fullDescription = error.message
          }
      } else {
          if (typeof description === 'string') {
              fullDescription = description
          } else {
              fullDescription = "Unknown error"
          }
      }
      
      handler(fullDescription)
  }
}