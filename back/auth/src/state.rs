use std::collections::HashMap;

pub struct State {
    storage: HashMap<String, String>,
}

impl State {
    pub fn new() -> State {
        State {
            storage: HashMap::new(),
        }
    }

    pub fn take(&mut self, state: &str) -> Option<String> {
        self.storage.remove(state)
    }

    pub fn put(&mut self, state: String, value: String) {
        self.storage.insert(state, value);
    }
}
