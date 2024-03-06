import { reactive, DynajElem, refs, DynajData, onChange } from 'dynaj';

const a = reactive(0);

onChange(a, () => {
  console.log(a.value);
});

const App = (_: DynajData, onInit: (cb: () => void) => void): DynajData => {
    onInit(() => {
        refs.btn.addEvent('click', () => {
            a.value += 1;
        });
    });

    return {
        type: 'div',
        attributes: { id: 'app' },
        css: {
            fontFamily: 'Arial, Helvetica, sans-serif'
        },
        children: [
            {
                type: 'h1',
                text: a
            },
            {
                type: 'button',
                text: 'CLICK ME!!',
                ref: 'btn'
            }
        ]
    };
};

new DynajElem({
    type: App,
    parent: 'body'
});
